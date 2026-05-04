// Vercel Serverless Function — handles all /api/* requests.
//
// We call the Express app directly instead of using serverless-http.
// serverless-http has known hangs with Express 5 on Vercel where the response
// promise never resolves, causing 300s timeouts.
const app = require('../server/app')

module.exports = (req, res) => {
  // Vercel sometimes strips /api prefix when invoking via catch-all rewrites.
  // Express routes are mounted at /api/*, so re-add the prefix if missing.
  if (req.url && !req.url.startsWith('/api')) {
    req.url = '/api' + (req.url.startsWith('/') ? req.url : '/' + req.url)
  }
  return app(req, res)
}
