// Vercel Serverless Function entry point.
// Catches all /api/* requests (see vercel.json rewrites) and hands off to the Express app.
const serverless = require('serverless-http')
const app = require('../server/app')

module.exports = serverless(app)
