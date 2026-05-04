// Vercel Serverless Function — catch-all for /api/*.
// File-based catch-all routing means Vercel auto-routes ANY /api/* path here
// (e.g. /api/health, /api/auth/me, /api/papers/123). The Express app sees the
// original URL and dispatches to the right route.
const serverless = require('serverless-http')
const app = require('../server/app')

module.exports = serverless(app)
