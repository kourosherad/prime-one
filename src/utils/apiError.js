/**
 * Typed API error. Thrown from controllers/services; the error middleware
 * maps it to an HTTP status + standard envelope.
 */
class ApiError extends Error {
  constructor(statusCode, message, code, details) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(msg, details) {
    return new ApiError(400, msg || 'درخواست نامعتبر است.', 'BAD_REQUEST', details);
  }
  static unauthorized(msg) {
    return new ApiError(401, msg || 'احراز هویت نشده‌اید.', 'UNAUTHORIZED');
  }
  static forbidden(msg) {
    return new ApiError(403, msg || 'دسترسی مجاز نیست.', 'FORBIDDEN');
  }
  static notFound(msg) {
    return new ApiError(404, msg || 'موردی یافت نشد.', 'NOT_FOUND');
  }
  static conflict(msg) {
    return new ApiError(409, msg || 'تداخل اطلاعات.', 'CONFLICT');
  }
  static unprocessable(msg, details) {
    return new ApiError(422, msg || 'خطای اعتبارسنجی.', 'VALIDATION_ERROR', details);
  }
  static internal(msg) {
    return new ApiError(500, msg || 'خطای سرور.', 'INTERNAL_ERROR');
  }
}

module.exports = ApiError;
