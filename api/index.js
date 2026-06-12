// Vercel Serverless Function — handles all /api/* requests.
//
// We call the Express app directly instead of using serverless-http.
// serverless-http has known hangs with Express 5 on Vercel where the response
// promise never resolves, causing 300s timeouts.
let app
let loadError
try {
  app = require('../server/app')
} catch (e) {
  loadError = e
  console.error('[api/index] FATAL: failed to load server/app:', e.message)
  console.error(e.stack)
}

module.exports = (req, res) => {
  if (loadError) {
    res.statusCode = 500
    res.setHeader('Content-Type', 'application/json')
    return res.end(JSON.stringify({
      error: 'APP_LOAD_FAILED',
      message: loadError.message,
      stack: loadError.stack?.split('\n').slice(0, 5).join('\n'),
    }))
  }
  // Vercel sometimes strips /api prefix when invoking via catch-all rewrites.
  // Express routes are mounted at /api/*, so re-add the prefix if missing.
  if (req.url && !req.url.startsWith('/api')) {
    req.url = '/api' + (req.url.startsWith('/') ? req.url : '/' + req.url)
  }
  return app(req, res)
}
