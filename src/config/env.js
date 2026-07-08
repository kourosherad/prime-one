/**
 * Centralized, validated environment access.
 * Every module should import values from here rather than process.env directly,
 * so that defaults and required checks live in one place.
 */
require('dotenv').config();

const required = (key, val = process.env[key]) => {
  if (val === undefined || val === null || val === '') {
    throw new Error(`[env] Missing required environment variable: ${key}`);
  }
  return val;
};

const bool = (val, fallback = false) => {
  if (val === undefined) return fallback;
  return String(val).toLowerCase() === 'true' || val === '1';
};

const int = (val, fallback) => {
  const n = parseInt(val, 10);
  return Number.isNaN(n) ? fallback : n;
};

const isProd = process.env.NODE_ENV === 'production';

module.exports = {
  isProd,
  isDev: process.env.NODE_ENV !== 'production',

  app: {
    name: process.env.APP_NAME || 'Prime One',
    port: int(process.env.PORT, 3000),
    url: process.env.APP_URL || 'http://localhost:3000',
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    sessionSecret: process.env.SESSION_SECRET || 'dev-session-secret-change-me',
  },

  db: {
    host: required('DB_HOST'),
    port: int(process.env.DB_PORT, 3306),
    user: required('DB_USER'),
    password: process.env.DB_PASSWORD || '',
    database: required('DB_NAME'),
    connectionLimit: int(process.env.DB_CONNECTION_LIMIT, 10),
    timezone: process.env.DB_TIMEZONE || '+00:00',
  },

  jwt: {
    secret: required('JWT_SECRET'),
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshSecret: required('JWT_REFRESH_SECRET'),
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    saltRounds: int(process.env.BCRYPT_SALT_ROUNDS, 12),
  },

  zarinpal: {
    sandbox: bool(process.env.ZARINPAL_SANDBOX, true),
    merchantId: process.env.ZARINPAL_MERCHANT_ID || '00000000-0000-0000-0000-000000000000',
    requestUrl:
      process.env.ZARINPAL_REQUEST_URL ||
      'https://api.zarinpal.com/pg/v4/payment/request.json',
    verifyUrl:
      process.env.ZARINPAL_VERIFY_URL ||
      'https://api.zarinpal.com/pg/v4/payment/verify.json',
    gateway: process.env.ZARINPAL_GATEWAY || 'https://www.zarinpal.com/pg/StartPay/',
    callbackPath: process.env.ZARINPAL_CALLBACK_PATH || '/api/payment/verify',
  },

  mail: {
    transport: process.env.MAIL_TRANSPORT || 'console',
    host: process.env.MAIL_HOST || 'smtp.example.com',
    port: int(process.env.MAIL_PORT, 587),
    secure: bool(process.env.MAIL_SECURE, false),
    user: process.env.MAIL_USER || '',
    pass: process.env.MAIL_PASS || '',
    from: process.env.MAIL_FROM || 'no-reply@primeone.local',
    fromName: process.env.MAIL_FROM_NAME || 'Prime One',
  },

  upload: {
    dir: process.env.UPLOAD_DIR || 'uploads',
    maxFileMb: int(process.env.UPLOAD_MAX_FILE_MB, 5),
  },

  rateLimit: {
    windowMs: int(process.env.RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
    max: int(process.env.RATE_LIMIT_MAX, 300),
    authMax: int(process.env.AUTH_RATE_LIMIT_MAX, 10),
  },
};
