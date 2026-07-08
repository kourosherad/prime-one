/**
 * Auth routes. Auth-sensitive routes are behind authLimiter.
 */
const express = require('express');
const { body } = require('express-validator');
const ctrl = require('../controllers/authController');
const validate = require('../middlewares/validate');
const { authLimiter } = require('../middlewares/rateLimiters');
const auth = require('../middlewares/auth');

const router = express.Router();

const passwordRules = [
  body('password')
    .isLength({ min: 8 })
    .withMessage('رمز عبور باید حداقل ۸ کاراکتر باشد.')
    .matches(/[A-Za-z]/)
    .withMessage('رمز عبور باید شامل حروف باشد.'),
];

router.post(
  '/register',
  authLimiter,
  validate([
    body('firstName').trim().notEmpty().withMessage('نام الزامی است.'),
    body('lastName').trim().notEmpty().withMessage('نام خانوادگی الزامی است.'),
    body('email').isEmail().withMessage('ایمیل معتبر نیست.').normalizeEmail(),
    body('phone').optional().isMobilePhone('fa-IR').withMessage('شماره موبایل معتبر نیست.'),
    ...passwordRules,
  ]),
  ctrl.register
);

router.post(
  '/login',
  authLimiter,
  validate([
    body('email').isEmail().normalizeEmail().withMessage('ایمیل معتبر نیست.'),
    body('password').notEmpty().withMessage('رمز عبور الزامی است.'),
  ]),
  ctrl.login
);

router.post('/refresh', ctrl.refresh);

router.post('/logout', ctrl.logout);

router.get('/verify-email', ctrl.verifyEmail);

router.post(
  '/forgot-password',
  authLimiter,
  validate([body('email').isEmail().normalizeEmail()]),
  ctrl.forgotPassword
);

router.post(
  '/reset-password',
  validate([...passwordRules, body('token').notEmpty().withMessage('توکن الزامی است.')]),
  ctrl.resetPassword
);

router.get('/me', auth(), ctrl.me);

module.exports = router;
