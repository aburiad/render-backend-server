// Render.com entry point.
// Render runs a persistent Node.js server (not serverless),
// so function timeouts are not an issue — Gemini vision calls
// can take 20-30s without being killed.
require('dotenv').config()
const app = require('./app')

const PORT = process.env.PORT || 5000

// ── Graceful shutdown ──────────────────────────────────────────────
// Render sends SIGTERM before killing the instance (default: 30s grace).
// We stop accepting new connections and let in-flight requests finish.
// The Gemini queue drains naturally — requests in the queue are rejected
// with 503 so the client can retry on the new instance.
let server
const SHUTDOWN_TIMEOUT_MS = 25_000 // 25s — leaves 5s buffer before Render's SIGKILL

function gracefulShutdown(signal) {
  console.log(`[render-server] ${signal} received — draining connections…`)
  if (!server) return process.exit(0)

  // Stop accepting new connections
  server.close(() => {
    console.log('[render-server] All connections closed — exiting')
    process.exit(0)
  })

  // Force exit after timeout (Render sends SIGKILL at 30s regardless)
  setTimeout(() => {
    console.warn('[render-server] Forced shutdown — timeout exceeded')
    process.exit(1)
  }, SHUTDOWN_TIMEOUT_MS)
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))

// ── Crash protection ───────────────────────────────────────────────
// Uncaught errors should log but NOT crash in production — Render will
// restart the instance anyway, but a clean error log is more useful
// than a silent crash. In development, let it crash for stack traces.
process.on('uncaughtException', (err) => {
  console.error('[render-server] UNCAUGHT EXCEPTION:', err)
  if (process.env.NODE_ENV !== 'production') process.exit(1)
})

process.on('unhandledRejection', (reason) => {
  console.error('[render-server] UNHANDLED REJECTION:', reason)
  // Don't exit — log and continue. Unhandled rejections are often
  // non-fatal (e.g., fire-and-forget Supabase RPC logging calls).
})

// ── Start server ───────────────────────────────────────────────────
server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`[render-server] listening on http://0.0.0.0:${PORT}`)
})

// Set HTTP keep-alive timeout to match Render's load balancer (60s).
// Default Node.js timeout is 5 min — wastes resources on free tier.
server.timeout = 90_000 // matches our PROVIDER_TIMEOUT_MS
server.keepAliveTimeout = 61_000 // 1s longer than Render LB (60s)
server.headersTimeout = 65_000 // must be > keepAliveTimeout
