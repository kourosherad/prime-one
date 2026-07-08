/**
 * Rate limiters. Global API limiter is wired in app.js; authLimiter is applied
 * to login/register/forgot-password routes specifically.
 */
const rateLimit = require('express-rate-limit');
const env = require('../config/env');

const standardHeaders = {
  standardHeaders: true,
  legacyHeaders: false,
};

const messageFa = { success: false, message: 'تعداد درخواست‌ها بیش از حد مجاز است. کمی بعد تلاش کنید.' };

const apiLimiter = rateLimit({
  windowMs: env.rateLimit.windowMs,
  max: env.rateLimit.max,
  ...standardHeaders,
  message: messageFa,
});

const authLimiter = rateLimit({
  windowMs: env.rateLimit.windowMs,
  max: env.rateLimit.authMax,
  ...standardHeaders,
  message: messageFa,
});

module.exports = { apiLimiter, authLimiter };
