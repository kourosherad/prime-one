/**
 * Payment controller. ZarinPal redirects here after the user pays; we verify,
 * then redirect the browser to a status page (with the order number).
 */
const { paymentService } = require('../services/payment');
const orderModel = require('../models/orderModel');
const env = require('../config/env');
const { api } = require('../utils/response');
const ApiError = require('../utils/apiError');

// POST /api/payment/request is the same as checkout.create — the order is the
// payment request. We expose a thin alias for documentation clarity.
exports.request = (req, res, next) =>
  require('../controllers/checkoutController').create(req, res, next);

// GET /api/payment/verify?track=TRK-...&Authority=...&Status=OK
exports.verify = async (req, res) => {
  const trackingCode = req.query.track;
  const authority = req.query.Authority;
  const status = req.query.Status;

  if (!trackingCode) throw ApiError.badRequest('کد پیگیری نامعتبر است.');

  const result = await paymentService.verify({ trackingCode, authority, status });

  let redirectUrl;
  const tx = await require('../models/transactionModel').byTracking(trackingCode);
  const order = tx?.order_id ? await orderModel.findById(tx.order_id) : null;
  const orderNumber = order?.order_number || '';

  if (result.failed) {
    redirectUrl = `${env.app.url}/pages/payment-result.html?status=fail&order=${orderNumber}`;
  } else if (result.success || result.alreadyPaid) {
    redirectUrl = `${env.app.url}/pages/payment-result.html?status=success&order=${orderNumber}`;
  } else {
    redirectUrl = `${env.app.url}/pages/payment-result.html?status=unknown&order=${orderNumber}`;
  }
  res.redirect(302, redirectUrl);
};

// JSON status helper for the SPA/JS to poll (optional).
exports.status = async (req, res) => {
  const tx = await require('../models/transactionModel').byTracking(req.params.track);
  if (!tx) throw ApiError.notFound('تراکنش یافت نشد.');
  res.json(api.success({ status: tx.status, referenceId: tx.reference_id, orderId: tx.order_id }));
};
