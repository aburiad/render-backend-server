/**
 * Per-feature usage limits for free users. No-op for now —
 * uncomment and tune once we decide on a quota model.
 */
function checkLimit(/* limitType */) {
  return async (_req, _res, next) => {
    next()
  }
}

module.exports = { checkLimit }
