/**
 * Thin client for the external Puppeteer PDF server with HF Space fallback.
 *
 * Primary:   Render-deployed PDF server (proshno-shala-pdf)
 * Fallback:  Hugging Face Space (hf-pdf-space) — wakes on first request
 *
 * Env vars required on this main app:
 *   PDF_SERVER_URL         — e.g. https://proshno-pdf.onrender.com
 *   PDF_SERVER_API_KEY     — shared secret (matches PDF_API_KEY on the PDF server)
 *   PDF_SERVER_FALLBACK_URL — (optional) e.g. https://user-proshno-shala-pdf.hf.space
 *
 * If primary fails (timeout, 5xx, connection error), automatically tries fallback.
 * If either primary URL or API_KEY is missing, `isConfigured()` returns false.
 */

const BASE = (process.env.PDF_SERVER_URL || '').replace(/\/+$/, '')
const FALLBACK_BASE = (process.env.PDF_SERVER_FALLBACK_URL || '').replace(/\/+$/, '')
const API_KEY = process.env.PDF_SERVER_API_KEY || ''
// Render free tier sleeps after 15min idle → first request can take 30-60s
// to spin Chromium back up. Give it room. Subsequent requests are fast.
const REQUEST_TIMEOUT_MS = Number(process.env.PDF_SERVER_TIMEOUT_MS || 90000)
// HF Space cold start can take 20-30s; give fallback a generous timeout too.
const FALLBACK_TIMEOUT_MS = Number(process.env.PDF_SERVER_FALLBACK_TIMEOUT_MS || 120000)

function isConfigured() {
  return Boolean(BASE && API_KEY)
}

function hasFallback() {
  return Boolean(FALLBACK_BASE && API_KEY)
}

/**
 * Internal: POST JSON to a specific base URL with timeout.
 */
async function postToUrl(baseUrl, path, body, timeoutMs) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(`${baseUrl}${path}`, {
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
      const err = new Error(`PDF server ${path} failed (${res.status}): ${text.slice(0, 300)}`)
      err.status = res.status
      throw err
    }
    return Buffer.from(await res.arrayBuffer())
  } catch (err) {
    if (err.name === 'AbortError') {
      const timeout = new Error(`PDF server request timed out after ${timeoutMs}ms`)
      timeout.status = 504
      throw timeout
    }
    throw err
  } finally {
    clearTimeout(timer)
  }
}

/**
 * POST to primary, then fallback if primary fails.
 * Retryable errors: timeout (504), connection refused, 5xx.
 * Non-retryable: 4xx (client errors like bad HTML).
 */
async function postJson(path, body) {
  if (!isConfigured()) {
    const err = new Error('PDF server is not configured (PDF_SERVER_URL / PDF_SERVER_API_KEY missing)')
    err.status = 503
    throw err
  }

  // Try primary first
  try {
    return await postToUrl(BASE, path, body, REQUEST_TIMEOUT_MS)
  } catch (primaryErr) {
    // If no fallback configured, or it's a client error (4xx), don't retry
    const status = primaryErr.status || 0
    const isClientError = status >= 400 && status < 500
    if (!hasFallback() || isClientError) {
      throw primaryErr
    }

    // Primary failed — try fallback
    console.warn(`[pdfServerClient] Primary failed (${primaryErr.message}), trying fallback…`)
    try {
      const result = await postToUrl(FALLBACK_BASE, path, body, FALLBACK_TIMEOUT_MS)
      console.info('[pdfServerClient] Fallback succeeded')
      return result
    } catch (fallbackErr) {
      // Both failed — throw the primary error (more relevant)
      console.error(`[pdfServerClient] Both primary and fallback failed. Primary: ${primaryErr.message}, Fallback: ${fallbackErr.message}`)
      throw primaryErr
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
    // Legacy default matches the html2pdf.js path: vertical 14mm, horizontal 0mm
    // (horizontal padding is baked into the paper template at 12mm).
    opts.margin = { top: '14mm', right: '0mm', bottom: '14mm', left: '0mm' }
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

module.exports = { isConfigured, renderHtml, renderUrl, mapPrintSettings }
