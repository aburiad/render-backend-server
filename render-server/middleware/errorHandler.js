function errorHandler(err, req, res, next) {
  console.error('Error:', err.message)
  console.error(err.stack)

  // Both `statusCode` (AppError) and `status` (pdfServerClient / http errors)
  const statusCode = err.statusCode || err.status || 500
  // For 500, hide internal details in production unless it's an explicit AppError.
  const message = (statusCode === 500 && process.env.NODE_ENV === 'production' && !(err instanceof AppError))
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
