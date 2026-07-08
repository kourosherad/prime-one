/**
 * Centralized error handler. Maps ApiError -> envelope; logs unexpected errors.
 * Also converts knex/MySQL duplicate-entry errors into 409s where possible.
 */
const logger = require('../config/logger');
const { api } = require('../utils/response');
const env = require('../config/env');

// 404 for unmatched routes.
const notFound = (req, _res, next) => {
  const ApiError = require('../utils/apiError');
  next(ApiError.notFound(`مسیر ${req.method} ${req.originalUrl} یافت نشد.`));
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, _next) => {
  let error = err;

  // Knex duplicate entry -> conflict
  if (err && (err.code === 'ER_DUP_ENTRY' || err.errno === 1062)) {
    const ApiError = require('../utils/apiError');
    error = ApiError.conflict('این مقدار قبلاً ثبت شده است.');
  }

  const statusCode = error.statusCode || 500;
  const isOperational = !!error.isOperational;

  if (!isOperational) {
    logger.error(`[error] ${req.method} ${req.originalUrl} → ${err.message}`, {
      stack: err.stack,
    });
  }

  const payload = api.error(
    error.message || 'خطای سرور.',
    error.code,
    env.isProd && !isOperational ? undefined : error.details
  );

  res.status(statusCode).json(payload);
};

module.exports = { errorHandler, notFound };
