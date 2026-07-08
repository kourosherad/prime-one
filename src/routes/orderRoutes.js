/**
 * Order + checkout routes.
 */
const express = require('express');
const { body } = require('express-validator');
const ctrl = require('../controllers/checkoutController');
const paymentCtrl = require('../controllers/paymentController');
const auth = require('../middlewares/auth');
const validate = require('../middlewares/validate');

const router = express.Router();

// Create order + initiate payment.
router.post(
  '/',
  auth(),
  validate([
    body('items').isArray({ min: 1 }).withMessage('سبد خرید خالی است.'),
    body('items.*.productId').isInt({ min: 1 }),
    body('items.*.quantity').isInt({ min: 1 }),
    body('walletUse').optional().isInt({ min: 0 }),
    body('couponCode').optional().isString(),
    body('note').optional().isString(),
  ]),
  ctrl.create
);

router.get('/:id', auth(), ctrl.order);
router.get('/by-number/:number', auth(), ctrl.orderByNumber);

module.exports = router;

// Payment routes are mounted separately but live here for cohesion.
const paymentRouter = express.Router();
paymentRouter.post('/request', auth(), validate([
  body('items').isArray({ min: 1 }),
]), paymentCtrl.request);
paymentRouter.get('/verify', paymentCtrl.verify);
paymentRouter.get('/status/:track', paymentCtrl.status);

module.exports.paymentRouter = paymentRouter;
