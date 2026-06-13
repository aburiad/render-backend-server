/**
 * Thin client for the external Puppeteer PDF server.
 *
 * PDF server URL is resolved dynamically from Supabase `pdf_server_config`
 * so admins can switch between Render PDF and HF PDF from the dashboard.
 * Falls back to env vars (PDF_SERVER_URL / PDF_SERVER_FALLBACK_URL) if
 * Supabase is unreachable or has no config yet.
 *
 * Env vars (still required as fallback):
 *   PDF_SERVER_URL          — primary (e.g. Render PDF)
 *   PDF_SERVER_FALLBACK_URL — secondary (e.g. HF PDF)
 *   PDF_SERVER_API_KEY      — shared secret (matches PDF_API_KEY on the PDF server)
 */

const configService = require('./configService')

const ENV_PRIMARY = (process.env.PDF_SERVER_URL || '').replace(/\/+$/, '')
const ENV_FALLBACK = (process.env.PDF_SERVER_FALLBACK_URL || '').replace(/\/+$/, '')
const API_KEY = process.env.PDF_SERVER_API_KEY || ''
const REQUEST_TIMEOUT_MS = Number(process.env.PDF_SERVER_TIMEOUT_MS || 55_000)

// Cache Supabase config for up to 60 seconds to avoid a DB query on every PDF request.
let _cachedConfig = null
let _cacheExpiry = 0
const CACHE_TTL_MS = 60_000

function isConfigured() {
  return Boolean((ENV_PRIMARY || ENV_FALLBACK) && API_KEY)
}

/**
 * Resolve the active PDF server URL from Supabase config.
 * Returns { url, label } or falls back to env vars.
 */
async function resolvePdfUrl() {
  const now = Date.now()
  if (_cachedConfig && now < _cacheExpiry) {
    return _cachedConfig
  }

  try {
    const config = await configService.getConfig()
    const pdf = config?.pdfServerConfig

    if (pdf) {
      let url = ''
      let label = ''

      if (pdf.active === 'hfspace' && pdf.hfspace_url) {
        url = pdf.hfspace_url.replace(/\/+$/, '')
        label = 'HF Space'
      } else if (pdf.active === 'render' && pdf.render_url) {
        url = pdf.render_url.replace(/\/+$/, '')
        label = 'Render'
      } else {
        // 'auto' — try primary first, fallback second
        url = pdf.render_url?.replace(/\/+$/, '') || pdf.hfspace_url?.replace(/\/+$/, '') || ENV_PRIMARY || ENV_FALLBACK
        label = 'Auto'
      }

      if (url) {
        const result = { url, label }
        _cachedConfig = result
        _cacheExpiry = now + CACHE_TTL_MS
        return result
      }
    }
  } catch (err) {
    console.warn('[pdfServerClient] Failed to read Supabase config, using env vars:', err.message)
  }

  // Fallback to env vars
  const result = {
    url: ENV_PRIMARY || ENV_FALLBACK,
    label: ENV_PRIMARY ? 'Env Primary' : 'Env Fallback',
  }
  _cachedConfig = result
  _cacheExpiry = now + CACHE_TTL_MS
  return result
}

/**
 * Clear the cached config so the next request re-reads from Supabase.
 * Called after admin saves a new pdfServerConfig.
 */
function clearCache() {
  _cachedConfig = null
  _cacheExpiry = 0
}

const MAX_503_RETRIES = 2
const RETRY_DELAY_MS = 5000

async function postJson(path, body) {
  if (!isConfigured()) {
    const err = new Error('PDF server is not configured (PDF_SERVER_URL / PDF_SERVER_API_KEY missing)')
    err.status = 503
    throw err
  }

  const { url: BASE, label } = await resolvePdfUrl()
  if (!BASE) {
    const err = new Error('PDF server URL is not configured (check admin dashboard PDF Server settings)')
    err.status = 503
    throw err
  }

  console.log(`[pdfServerClient] → ${label}: ${BASE}${path}`)

  for (let attempt = 0; attempt <= MAX_503_RETRIES; attempt++) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
    try {
      const res = await fetch(`${BASE}${path}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_KEY,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      })
      if (!res.ok) {
        const text = await res.text().catch(() => '')
        // 503 = Render free-tier cold start. Retry after a delay
        // instead of failing immediately. Frontend gives us 120s.
        if (res.status === 503 && attempt < MAX_503_RETRIES) {
          console.warn(`[pdfServerClient] 503 cold start (attempt ${attempt + 1}/${MAX_503_RETRIES}), retrying in ${RETRY_DELAY_MS}ms…`)
          clearTimeout(timer)
          await new Promise(r => setTimeout(r, RETRY_DELAY_MS))
          continue
        }
        const err = new Error(`PDF server ${path} failed (${res.status}): ${text.slice(0, 300)}`)
        err.status = res.status
        throw err
      }
      return Buffer.from(await res.arrayBuffer())
    } catch (err) {
      if (err.name === 'AbortError') {
        const timeout = new Error(`PDF server request timed out after ${REQUEST_TIMEOUT_MS}ms`)
        timeout.status = 504
        throw timeout
      }
      throw err
    } finally {
      clearTimeout(timer)
    }
  }
}

async function renderHtml({ html, css, filename, waitForSelector, waitForNetworkIdle, options }) {
  return postJson('/pdf/render', {
    html, css, filename, waitForSelector, waitForNetworkIdle, options,
  })
}

async function renderUrl({ url, filename, waitForSelector, waitForNetworkIdle, authHeaders, options }) {
  return postJson('/pdf/url', {
    url, filename, waitForSelector, waitForNetworkIdle, authHeaders, options,
  })
}

/**
 * Map the editor's `print_settings` object → Puppeteer pdf() options.
 * Mirrors the mapping in pdf-generator-server-future/client-example/pdfClient.js.
 * Whenever the modal adds a new field (margin, pageFormat, scale, …),
 * extend this function — no changes needed on the PDF server side.
 */
function mapPrintSettings(settings = {}) {
  const opts = {}

  if (settings.pageFormat) {
    const f = String(settings.pageFormat).trim()
    opts.format = f.charAt(0).toUpperCase() + f.slice(1).toLowerCase()
  } else {
    opts.format = 'A4'
  }

  if (settings.orientation === 'landscape') opts.landscape = true

  if (settings.margin) {
    if (typeof settings.margin === 'string') {
      opts.margin = {
        top: settings.margin, right: settings.margin,
        bottom: settings.margin, left: settings.margin,
      }
    } else {
      opts.margin = {
        top: settings.margin.top ?? '0mm',
        right: settings.margin.right ?? '0mm',
        bottom: settings.margin.bottom ?? '0mm',
        left: settings.margin.left ?? '0mm',
      }
    }
  } else {
    opts.margin = { top: '0mm', right: '0mm', bottom: '0mm', left: '0mm' }
  }

  if (typeof settings.scale === 'number') {
    opts.scale = Math.min(2, Math.max(0.1, settings.scale))
  }
  if (settings.pageRanges) opts.pageRanges = String(settings.pageRanges)
  if (settings.headerTemplate || settings.footerTemplate) {
    opts.displayHeaderFooter = true
    if (settings.headerTemplate) opts.headerTemplate = settings.headerTemplate
    if (settings.footerTemplate) opts.footerTemplate = settings.footerTemplate
  }
  return opts
}

module.exports = { isConfigured, renderHtml, renderUrl, mapPrintSettings, clearCache }