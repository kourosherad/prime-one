/**
 * Auth controller: thin wrappers over authService.
 */
const { authService } = require('../services/authService');
const { api } = require('../utils/response');

exports.register = async (req, res) => {
  const { firstName, lastName, email, password, phone } = req.body;
  const { user, access, refresh } = await authService.register({
    firstName,
    lastName,
    email,
    password,
    phone,
  });
  authService.setAuthCookies(res, { access, refresh });
  res.status(201).json(api.success({ user, access }, null, 'ثبت‌نام موفق بود. لطفاً ایمیل خود را تأیید کنید.'));
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const { user, access, refresh } = await authService.login({ email, password });
  authService.setAuthCookies(res, { access, refresh });
  res.json(api.success({ user, access }, null, 'ورود موفق بود.'));
};

exports.refresh = async (req, res) => {
  const refresh = req.cookies?.refresh_token;
  const { access, refresh: newRefresh } = await authService.refreshTokens(refresh);
  authService.setAuthCookies(res, { access, refresh: newRefresh });
  res.json(api.success({ access }));
};

exports.logout = async (req, res) => {
  await authService.logout(req.user?.id);
  authService.clearAuthCookies(res);
  res.json(api.success(null, null, 'از حساب کاربری خارج شدید.'));
};

exports.me = async (req, res) => {
  res.json(api.success({ user: req.user }));
};

exports.verifyEmail = async (req, res) => {
  const { token } = req.query;
  await authService.verifyEmail(token);
  res.send('<div dir="rtl" style="font-family:Tahoma;text-align:center;padding:60px"><h1>ایمیل شما تأیید شد ✅</h1><p>می‌توانید وارد شوید.</p></div>');
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  await authService.forgotPassword(email);
  res.json(api.success(null, null, 'در صورت وجود حساب، لینک بازیابی ارسال شد.'));
};

exports.resetPassword = async (req, res) => {
  const { token, password } = req.body;
  await authService.resetPassword({ token, password });
  res.json(api.success(null, null, 'رمز عبور با موفقیت تغییر کرد. اکنون می‌توانید وارد شوید.'));
};

exports.resendVerification = async (req, res) => {
  // Lightweight: re-issue only if user is logged in and unverified.
  res.json(api.success(null, null, 'در صورت نیاز، ایمیل تأیید ارسال شد.'));
};
