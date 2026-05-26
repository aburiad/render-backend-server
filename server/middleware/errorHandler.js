function errorHandler(err, req, res, next) {
  console.error('[errorHandler]', err.message)
  if (err.stack) console.error(err.stack)

  // Both `statusCode` (AppError) and `status` (pdfServerClient / http errors)
  const statusCode = err.statusCode || err.status || 500
  // For 500, hide internal details in production. For everything else
  // (400, 401, 404, 503…) the specific message is safe to return.
  const message = statusCode === 500 && process.env.NODE_ENV === 'production'
    ? 'Internal server error'
    : err.message

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  })
}

class AppError extends Error {
  constructor(message, statusCode) {
    super(message)
    this.statusCode = statusCode
  }
}

module.exports = { errorHandler, AppError }
