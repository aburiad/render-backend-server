// Vercel Serverless Function — catch-all for /api/*.
//
// Vercel's catch-all routing sometimes strips the leading /api segment before
// invoking the function (so Express sees /auth/me instead of /api/auth/me).
// Our Express routes are mounted at /api/*, so we re-add the prefix if missing.
const serverless = require('serverless-http')
const app = require('../server/app')

const handler = serverless(app)

module.exports = async (req, res) => {
  if (req.url && !req.url.startsWith('/api')) {
    req.url = '/api' + (req.url.startsWith('/') ? req.url : '/' + req.url)
  }
  return handler(req, res)
}
