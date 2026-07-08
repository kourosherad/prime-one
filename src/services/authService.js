/**
 * Auth service: registration, login, token issuance + refresh rotation,
 * email verification, password reset. Keeps controllers thin.
 */
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const env = require('../config/env');
const { jwtUtil } = require('../utils/jwt');
const { hashUtil } = require('../utils/hash');
const { random } = require('../utils/random');
const userModel = require('../models/userModel');
const walletModel = require('../models/walletModel');
const { mailService } = require('./mailService');
const ApiError = require('../utils/apiError');
const { ROLES, USER_STATUS } = require('../config/constants');

const issueTokens = (user) => {
  const payload = {
    sub: user.id,
    role: user.role,
    email: user.email,
  };
  const access = jwtUtil.sign(payload);
  const refresh = jwtUtil.signRefresh({ sub: user.id });
  return { access, refresh };
};

// Hash a refresh token before storing (so a DB leak doesn't expose live tokens).
const hashToken = (token) => bcrypt.hashSync(token, 10);
const compareToken = (token, hash) => bcrypt.compareSync(token, hash);

const setAuthCookies = (res, { access, refresh }) => {
  res.cookie('access_token', access, {
    httpOnly: true,
    secure: env.isProd,
    sameSite: 'lax',
    maxAge: 15 * 60 * 1000,
  });
  res.cookie('refresh_token', refresh, {
    httpOnly: true,
    secure: env.isProd,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/api/auth',
  });
};

const clearAuthCookies = (res) => {
  res.clearCookie('access_token');
  res.clearCookie('refresh_token', { path: '/api/auth' });
};

const register = async ({ firstName, lastName, email, password, phone }) => {
  const existing = await userModel.findByEmail(email);
  if (existing) throw ApiError.conflict('این ایمیل قبلاً ثبت شده است.');

  const passwordHash = await hashUtil.hash(password);
  const verifyToken = random.token(16);
  const user = await userModel.create({
    uuid: uuidv4(),
    first_name: firstName,
    last_name: lastName,
    email,
    phone: phone || null,
    password_hash: passwordHash,
    role: ROLES.CUSTOMER,
    status: USER_STATUS.ACTIVE,
    email_verified: false,
    email_verify_token: verifyToken,
  });

  await walletModel.ensureForUser(user.id);

  // Best-effort verification email.
  const link = `${env.app.url}/api/auth/verify-email?token=${verifyToken}`;
  mailService.verifyEmail(email, { name: firstName, link }).catch(() => {});

  const { access, refresh } = issueTokens(user);
  await userModel.setRefreshToken(user.id, hashToken(refresh));
  return { user: userModel.constructor.safe(user), access, refresh };
};

const login = async ({ email, password }) => {
  const user = await userModel.findByEmail(email);
  if (!user) throw ApiError.unauthorized('ایمیل یا رمز عبور نادرست است.');
  const ok = await hashUtil.compare(password, user.password_hash);
  if (!ok) throw ApiError.unauthorized('ایمیل یا رمز عبور نادرست است.');
  if (user.status !== USER_STATUS.ACTIVE) {
    throw ApiError.forbidden('حساب کاربری شما غیرفعال یا مسدود است.');
  }

  await userModel.touchLogin(user.id);
  const { access, refresh } = issueTokens(user);
  await userModel.setRefreshToken(user.id, hashToken(refresh));
  return { user: userModel.constructor.safe(user), access, refresh };
};

const refreshTokens = async (refreshCookie) => {
  if (!refreshCookie) throw ApiError.unauthorized('نشست نامعتبر است.');
  let payload;
  try {
    payload = jwtUtil.verifyRefresh(refreshCookie);
  } catch {
    throw ApiError.unauthorized('نشست نامعتبر است.');
  }
  const user = await userModel.findById(payload.sub);
  if (!user || !user.refresh_token_hash) throw ApiError.unauthorized('نشست نامعتبر است.');
  const ok = compareToken(refreshCookie, user.refresh_token_hash);
  if (!ok) {
    // Possible token reuse — invalidate.
    await userModel.clearRefreshToken(user.id);
    throw ApiError.unauthorized('نشست نامعتبر است.');
  }
  const { access, refresh } = issueTokens(user);
  await userModel.setRefreshToken(user.id, hashToken(refresh));
  return { access, refresh };
};

const logout = async (userId) => {
  if (userId) await userModel.clearRefreshToken(userId);
};

const verifyEmail = async (token) => {
  const user = await userModel.findOne({ email_verify_token: token });
  if (!user) throw ApiError.badRequest('لینک تأیید نامعتبر است.');
  await userModel.verifyEmail(user.id);
};

const forgotPassword = async (email) => {
  const user = await userModel.findByEmail(email);
  // Always return success-like to avoid email enumeration; only mail if exists.
  if (!user) return;
  const token = random.token(20);
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1h
  await userModel.setPasswordReset(email, token, expires);
  const link = `${env.app.url}/pages/reset-password.html?token=${token}`;
  mailService.resetPassword(email, { name: user.first_name, link }).catch(() => {});
};

const resetPassword = async ({ token, password }) => {
  const user = await userModel.findOne({ password_reset_token: token });
  if (!user || !user.password_reset_expires || new Date(user.password_reset_expires) < new Date()) {
    throw ApiError.badRequest('لینک بازیابی نامعتبر یا منقضی است.');
  }
  const hash = await hashUtil.hash(password);
  await userModel.update(user.id, {
    password_hash: hash,
    password_reset_token: null,
    password_reset_expires: null,
  });
  await userModel.clearRefreshToken(user.id);
};

module.exports = { authService: { register, login, refreshTokens, logout, verifyEmail, forgotPassword, resetPassword, issueTokens, setAuthCookies, clearAuthCookies } };
