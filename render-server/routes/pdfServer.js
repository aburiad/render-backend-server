const express = require('express')
const paperService = require('../services/paperService')
const pdfServerClient = require('../services/pdfServerClient')
const { AppError } = require('../middleware/errorHandler')
const { requireAuth } = require('../middleware/auth')

const router = express.Router()

function safeFilename(name, fallback = 'paper') {
  // Only allow ASCII word chars, dots, dashes, spaces — no Bengali or
  // other non-ASCII characters because the filename goes into the
  // Content-Disposition HTTP header which rejects non-ASCII bytes.
  const cleaned = String(name || fallback)
    .replace(/[^\w\-. ]+/g, '')
    .replace(/\s+/g, '_')
    .slice(0, 100)
  return (cleaned || fallback) + '.pdf'
}

// GET /api/pdf-server/status — public probe (no auth) so the frontend
// can detect whether the external Puppeteer service is configured, and
// so admins can verify env wiring directly from a browser.
router.get('/status', (_req, res) => {
  res.json({ success: true, configured: pdfServerClient.isConfigured() })
})

// Auth gate for everything after this — the actual PDF render needs
// a logged-in user (paper ownership check).
router.use(requireAuth)

/**
 * POST /api/pdf-server/papers/:id
 *
 * Body (sent from the live editor):
 *   {
 *     html:    string  — paperRef.current.outerHTML wrapped in <html><head>… (see frontend helper)
 *     css?:    string  — extra CSS (optional, usually inlined via <style> in html)
 *     filename?: string
 *   }
 *
 * Server enriches with page-level options derived from the paper's
 * persisted `print_settings` and forwards to the Puppeteer server.
 * Returns application/pdf bytes.
 */
/**
 * POST /api/pdf-server/render — generic HTML-to-PDF.
 *
 * Body:
 *   { html: string, css?: string, filename?: string, orientation?: 'portrait'|'landscape' }
 *
 * No database lookup — just renders whatever HTML is sent.
 * Auth-gated so only logged-in users can hit it.
 */
router.post('/render', async (req, res, next) => {
  try {
    if (!pdfServerClient.isConfigured()) {
      throw new AppError('PDF সার্ভার এখনও কনফিগার হয়নি (অ্যাডমিনকে জানান)', 503)
    }

    const { html, css, filename: clientFilename, orientation } = req.body || {}
    if (!html || typeof html !== 'string') {
      throw new AppError('Body field `html` is required', 400)
    }
    if (html.length > 11 * 1024 * 1024) {
      throw new AppError('HTML payload too large (max 11 MB)', 413)
    }

    const filename = safeFilename(clientFilename || 'document')
    const options = pdfServerClient.mapPrintSettings({
      orientation: orientation || 'portrait',
      pageFormat: 'A4',
      margin: '14mm',
    })

    const buffer = await pdfServerClient.renderHtml({
      html,
      css,
      filename,
      // No waitForSelector — notices/routines/OMR don't set data-paper-ready.
      // Puppeteer will render immediately after network idle.
      waitForNetworkIdle: false,
      options,
    })

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Length', buffer.length)
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    res.setHeader('Cache-Control', 'no-store')
    return res.end(buffer)
  } catch (err) {
    console.error('[pdfServerRoute] generic render error:', err)
    if (err.status) {
      return next(new AppError(err.message, err.status))
    }
    return next(err)
  }
})

router.post('/papers/:id', async (req, res, next) => {
  try {
    if (!pdfServerClient.isConfigured()) {
      throw new AppError('PDF সার্ভার এখনও কনফিগার হয়নি (অ্যাডমিনকে জানান)', 503)
    }

    const paper = await paperService.getById(req.params.id, req.user.uid)
    if (!paper) throw new AppError('Paper not found', 404)

    const { html, css, filename: clientFilename } = req.body || {}
    if (!html || typeof html !== 'string') {
      throw new AppError('Body field `html` is required', 400)
    }
    if (html.length > 11 * 1024 * 1024) {
      throw new AppError('HTML payload too large (max 11 MB)', 413)
    }

    const options = pdfServerClient.mapPrintSettings(paper.print_settings || {})
    const filename = safeFilename(clientFilename || paper.exam_title || 'paper')

    const buffer = await pdfServerClient.renderHtml({
      html,
      css,
      filename,
      // Wait for the readiness marker (set in paperToPdfHtml.js) instead
      // of networkidle0. Render's proxy has a 30s timeout; real paper HTML
      // pulls external CSS/fonts that keep the network alive well past 30s.
      waitForSelector: '[data-paper-ready="true"]',
      waitForNetworkIdle: false,
      options,
    })

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Length', buffer.length)
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    res.setHeader('Cache-Control', 'no-store')
    return res.end(buffer)
  } catch (err) {
    console.error('[pdfServerRoute] PDF generation error:', err)
    if (err.status) {
      return next(new AppError(err.message, err.status))
    }
    return next(err)
  }
})

module.exports = router
