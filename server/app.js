const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const { errorHandler } = require('./middleware/errorHandler')

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

const app = express()
app.set('trust proxy', 1)

// CORS — single Vercel domain in production, plus localhost for dev.
const allowedOrigins = [
  process.env.CLIENT_URL,
  process.env.FRONTEND_URL,
  'http://localhost:5173',
].filter(Boolean)

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true)
      const ok =
        allowedOrigins.includes(origin) ||
        origin.endsWith('.vercel.app') ||
        origin.includes('localhost')
      callback(null, ok)
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
app.use(express.json({ limit: '25mb' }))
app.use(express.urlencoded({ extended: true, limit: '25mb' }))

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use('/api/auth', authRoutes)
app.use('/api/papers', paperRoutes)
app.use('/api/exam', examRoutes)
app.use('/api/payment', paymentRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/ai', aiRoutes)
app.use('/api/questions', questionRoutes)
app.use('/api/book', bookRoutes)
app.use('/api/user', userRoutes)
app.use('/api/notices', noticeRoutes)
app.use('/api', generateRoutes)

app.use(errorHandler)

module.exports = app
