const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const { errorHandler } = require('./middleware/errorHandler')
const {
  globalLimiter,
  authLimiter,
  aiLimiter,
  paymentLimiter,
  userKeyLimiter,
} = require('./middleware/rateLimit')
const { requireAuth } = require('./middleware/auth')

const authRoutes = require('./routes/auth')
const paperRoutes = require('./routes/papers')
const examRoutes = require('./routes/exam')
const paymentRoutes = require('./routes/payment')
const adminRoutes = require('./routes/admin')
const aiRoutes = require('./routes/ai')
const questionRoutes = require('./routes/questions')
const bookRoutes = require('./routes/book')
const generateRoutes = require('./routes/generate')
const userRoutes = require('./routes/user')
const noticeRoutes = require('./routes/notice')
const routineRoutes = require('./routes/routine')
const limitsRoutes = require('./routes/limits')

const app = express()
// trust proxy: 1 = trust EXACTLY the last hop (Vercel's edge proxy).
//
// Threat model assumption: requests reach the function with at most 1
// intermediate proxy that we control. The leftmost X-Forwarded-For IP
// is the client; Vercel appends its own IP as the trailing proxy.
//
// If you put Cloudflare / another CDN IN FRONT of Vercel, this number
// MUST be raised to 2 (or `true` with caution) — otherwise the IP-based
// rate limiter trusts the wrong field and attackers can spoof their IP
// by forging X-Forwarded-For. The rate limiter primarily keys on
// req.user.uid for authenticated routes (safe regardless), so the
// blast radius of mis-trust is only the unauthenticated paths.
app.set('trust proxy', 1)

// CORS — explicit allowlist, no wildcard *.vercel.app blanket.
//
// Allowed sources (in order of precedence):
//   1. ALLOWED_ORIGINS env var — comma-separated list of full origins
//      (e.g. "https://proshno-shala.vercel.app,https://proshno-shala.com")
//   2. CLIENT_URL / FRONTEND_URL env vars — single-origin convenience
//   3. Localhost variants (http://localhost:* and http://127.0.0.1:*) —
//      ONLY in non-production environments, for local dev.
//
// Why not allow `*.vercel.app`? Anyone can deploy to Vercel under any
// subdomain (e.g. `fake-proshno-shala.vercel.app`) and craft a phishing
// site that talks to this API — credentials: true would attach the user's
// JWT cookie to those requests. Strict allowlist closes that hole.
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)

const isProduction = process.env.NODE_ENV === 'production'

const baseAllowed = [
  process.env.CLIENT_URL,
  process.env.FRONTEND_URL,
  ...ALLOWED_ORIGINS,
].filter(Boolean)

function isAllowedOrigin(origin) {
  // Server-to-server / curl requests have no Origin header — allow.
  if (!origin) return true
  if (baseAllowed.includes(origin)) return true
  // Local dev exception — only outside production. Covers
  // http://localhost:5173, http://127.0.0.1:5173, etc.
  if (!isProduction) {
    try {
      const host = new URL(origin).hostname
      if (host === 'localhost' || host === '127.0.0.1') return true
    } catch {
      // malformed origin — reject
    }
  }
  return false
}

app.use(
  cors({
    origin(origin, callback) {
      if (isAllowedOrigin(origin)) return callback(null, true)
      // Log rejected origins so operators can tell when a legitimate
      // domain is missing from ALLOWED_ORIGINS. NOT fatal — return
      // false so cors strips headers and the browser blocks the request.
      if (origin) console.warn(`[cors] blocked unlisted origin: ${origin}`)
      return callback(null, false)
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  }),
)

app.use(
  helmet({
    crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false,
  }),
)

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'))
}

// Body parsers — per-route limits override the small default.
//   Default 1MB:  text-only routes (auth, exam answers, admin actions, etc.)
//   12MB:         AI scan (full-page image upload)
//   8MB:          notice + routine (logo + signature image base64)
//   8MB:          papers (multiple stimulus images can be base64-embedded)
//   2MB:          book generate (chapter context text)
const jsonDefault = express.json({ limit: '1mb' })
const urlEncodedDefault = express.urlencoded({ extended: true, limit: '1mb' })
const jsonAi = express.json({ limit: '12mb' })
const jsonImage = express.json({ limit: '8mb' })
const jsonBook = express.json({ limit: '2mb' })

// AI + image-heavy routes need the bigger parser BEFORE the small default.
// Express runs middleware in registration order; the first JSON parser to
// claim the body wins, so we mount the per-route parsers before the default.
app.use('/api/ai', jsonAi)
app.use('/api/papers', jsonImage)
app.use('/api/notices', jsonImage)
app.use('/api/routines', jsonImage)
app.use('/api/book', jsonBook)
app.use(jsonDefault)
app.use(urlEncodedDefault)

// Global IP cap — production only. In dev, all your hot-reload + page
// reloads + multiple browser tabs share localhost IP and easily blow past
// 200/15min, breaking your own iteration loop. Production attackers are
// the actual threat target.
if (process.env.NODE_ENV === 'production') {
  app.use('/api', globalLimiter)
}

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Rate-limited routes.
//
// IMPORTANT ordering for per-user limiters:
//   requireAuth → userKeyed limiter → router
// `requireAuth` must run FIRST so req.user.uid is populated when the
// limiter's keyGenerator reads it. Otherwise the limiter falls back to
// IP, and /api/limits/status (which always uses uid) reads a different
// counter — leading to the dashboard always showing 0 usage.
//
// `requireAuth` inside the router is harmless duplication (idempotent
// — JWT verify cached on req.user); leaving it for safety.
// Rate limiters apply ONLY in production. Dev + test bypass them so
// hot-reload page-spam doesn't lock you out of your own app.
const isProd = process.env.NODE_ENV === 'production'
const noop = (_, __, n) => n()

app.use('/api/auth', isProd ? authLimiter : noop, authRoutes)
app.use('/api/papers', paperRoutes)
app.use('/api/exam', examRoutes)
// /api/payment is mixed (config public, manual auth) — limiter applied
// inside payment.js on the /manual endpoint after requireAuth, not here.
app.use('/api/payment', paymentRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/ai', requireAuth, isProd ? aiLimiter : noop, aiRoutes)
app.use('/api/questions', questionRoutes)
app.use('/api/book', requireAuth, isProd ? aiLimiter : noop, bookRoutes)
app.use('/api/user', requireAuth, isProd ? userKeyLimiter : noop, userRoutes)
app.use('/api/notices', noticeRoutes)
app.use('/api/routines', routineRoutes)
// Status read endpoint — read-only, no rate limiter applied so the
// dashboard can poll it without affecting the user's actual quota.
app.use('/api/limits', limitsRoutes)
app.use('/api', requireAuth, isProd ? aiLimiter : noop, generateRoutes)

app.use(errorHandler)

module.exports = app
