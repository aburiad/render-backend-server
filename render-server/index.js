// Render.com entry point.
// Render runs a persistent Node.js server (not serverless),
// so function timeouts are not an issue — Gemini vision calls
// can take 20-30s without being killed.
require('dotenv').config()
const app = require('./app')

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`[render-server] listening on http://0.0.0.0:${PORT}`)
})
