/**
 * Thin client for the external Puppeteer PDF server.
 * The PDF server lives in `pdf-generator-server-future/` and is
 * deployed separately (Render free tier initially).
 *
 * Env vars required on this main app:
 *   PDF_SERVER_URL       — e.g. https://proshno-pdf.onrender.com
 *   PDF_SERVER_API_KEY   — shared secret (matches PDF_API_KEY on the PDF server)
 *
 * If either is missing, `isConfigured()` returns false. Callers should
 * surface a friendly error before invoking renderHtml/renderUrl.
 */

const BASE = (process.env.PDF_SERVER_URL || '').replace(/\/+$/, '')
const API_KEY = process.env.PDF_SERVER_API_KEY || ''
// Render free tier sleeps after 15min idle → first request can take 30-60s
// to spin Chromium back up. Give it room. Subsequent requests are fast.
const REQUEST_TIMEOUT_MS = Number(process.env.PDF_SERVER_TIMEOUT_MS || 90000)

function isConfigured() {
  return Boolean(BASE && API_KEY)
}

async function postJson(path, body) {
  if (!isConfigured()) {
    const err = new Error('PDF server is not configured (PDF_SERVER_URL / PDF_SERVER_API_KEY missing)')
    err.status = 503
    throw err
  }
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
    // Margin is handled by @page CSS in the HTML (paperToPdfHtml.js sets
    // `margin: 14mm 0`) so every page gets consistent top/bottom margin.
    // Setting Puppeteer margin to 0 avoids double-margin on page 1.
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

module.exports = { isConfigured, renderHtml, renderUrl, mapPrintSettings }
