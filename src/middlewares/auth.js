/**
 * Auth middleware: verifies the JWT access token from the Authorization header
 * or `access_token` cookie and attaches the user to req.user.
 */
const { jwtUtil } = require('../utils/jwt');
const userModel = require('../models/userModel');
const ApiError = require('../utils/apiError');

const getToken = (req) => {
  const header = req.headers.authorization;
  if (header && /^Bearer /i.test(header)) return header.slice(7).trim();
  if (req.cookies && req.cookies.access_token) return req.cookies.access_token;
  return null;
};

const auth = (options = {}) => {
  const { required = true, activeOnly = true } = options;
  return async (req, res, next) => {
    try {
      const token = getToken(req);
      if (!token) {
        if (required) throw ApiError.unauthorized('ورود به حساب کاربری لازم است.');
        req.user = null;
        return next();
      }

      const payload = jwtUtil.verify(token);
      const user = await userModel.findById(payload.sub);
      if (!user) {
        if (required) throw ApiError.unauthorized();
        req.user = null;
        return next();
      }
      if (activeOnly && user.status !== 'active') {
        throw ApiError.forbidden('حساب کاربری شما غیرفعال یا مسدود است.');
      }
      // Attach sanitized user.
      req.user = userModel.constructor.safe(user);
      req.user.roleLevel = payload.role;
      return next();
    } catch (err) {
      if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
        if (required) return next(ApiError.unauthorized('نشست شما منقضی شده است.'));
        req.user = null;
        return next();
      }
      return next(err);
    }
  };
};

module.exports = auth;
module.exports.auth = auth;
