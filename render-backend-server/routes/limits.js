const express = require('express')
const { requireAuth } = require('../middleware/auth')
const { readUsageForUser } = require('../middleware/rateLimit')

const router = express.Router()
router.use(requireAuth)

/**
 * Returns the current rate-limit usage for the authenticated user.
 * Frontend dashboards call this to show "AI: 12/30 left, resets in 35min".
 *
 * Counters live in memory per Vercel function instance, so the numbers
 * are best-effort: a different instance may show different values.
 * Acceptable for UX (informational); the actual enforcement happens on
 * the route the user is hitting.
 */
router.get('/status', async (req, res, next) => {
  try {
    const usage = await readUsageForUser(req.user.uid, req.ip)
    res.json({ success: true, usage })
  } catch (err) {
    next(err)
  }
})

module.exports = router
