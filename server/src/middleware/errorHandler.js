export const errorHandler = (err, req, res, next) => {
  console.error('[Error Handler]:', err);

  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  const response = {
    success: false,
    status: statusCode,
    message,
  };

  // Zod validation error handling
  if (err.name === 'ZodError' || err.errors) {
    // If Zod error
    if (Array.isArray(err.errors)) {
      return res.status(400).json({
        success: false,
        status: 400,
        message: 'Validation failed',
        errors: err.errors.map((e) => ({
          path: e.path.join('.'),
          message: e.message,
        })),
      });
    }
  }

  // Handle specific Prisma database errors
  if (err.code && err.code.startsWith('P')) {
    if (err.code === 'P2025') {
      return res.status(404).json({
        success: false,
        status: 404,
        message: 'Resource not found',
      });
    }
    if (err.code === 'P2002') {
      return res.status(400).json({
        success: false,
        status: 400,
        message: 'Database constraint violation: unique field collision',
      });
    }
  }

  if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test') {
    response.stack = err.stack;
  }

  return res.status(statusCode).json(response);
};

export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}
export default errorHandler;
