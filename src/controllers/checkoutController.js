/**
 * Checkout controller: creates an order from a validated cart, then hands off
 * to the payment service which returns the gateway redirect URL.
 */
const db = require('../config/db');
const { cartService } = require('../services/cartService');
const { paymentService } = require('../services/payment');
const walletModel = require('../models/walletModel');
const orderModel = require('../models/orderModel');
const couponModel = require('../models/couponModel');
const { random } = require('../utils/random');
const { ORDER_STATUS } = require('../config/constants');
const { api } = require('../utils/response');
const ApiError = require('../utils/apiError');
const { mailService } = require('../services/mailService');

exports.create = async (req, res) => {
  const { items, couponCode, walletUse, note } = req.body;
  const wallet = await walletModel.forUser(req.user.id);
  const walletBalance = wallet ? Number(wallet.balance) : 0;

  const summary = await cartService.priceCart(items, {
    couponCode: couponCode || null,
    walletUse: walletUse || 0,
    walletBalance,
  });

  const orderNumber = random.orderNumber();
  const total = summary.total;

  // Create order + items in a transaction.
  const orderId = await db.transaction(async (trx) => {
    const ids = await trx('orders').insert({
      order_number: orderNumber,
      user_id: req.user.id,
      status: ORDER_STATUS.AWAITING_PAYMENT,
      subtotal: summary.subtotal,
      discount: summary.discount,
      wallet_used: summary.walletUsed,
      tax: 0,
      total,
      coupon_code: summary.coupon ? summary.coupon.code : null,
      note: note || null,
    });
    const orderId = ids[0];

    const orderItems = summary.items.map((i) => ({
      order_id: orderId,
      product_id: i.productId,
      product_title: i.title,
      product_code: i.productCode,
      product_image: i.image,
      unit_price: i.unitPrice,
      quantity: i.quantity,
      line_total: i.lineTotal,
    }));
    await trx('order_items').insert(orderItems);

    // Decrement stock.
    for (const i of summary.items) {
      await trx('products')
        .where({ id: i.productId })
        .where('stock', '>=', i.quantity)
        .decrement('stock', i.quantity);
    }

    // Increment coupon usage.
    if (summary.coupon && summary.coupon.valid) {
      const coupon = await trx('coupons').where({ code: summary.coupon.code }).first();
      if (coupon) await trx('coupons').where({ id: coupon.id }).increment('used_count', 1);
    }

    return orderId;
  });

  const result = await paymentService.initiate({
    orderId,
    userId: req.user.id,
    amount: total,
    description: `سفارش ${orderNumber}`,
    gatewayName: 'zarinpal',
    meta: { email: req.user.email, mobile: req.user.phone },
  });

  // Best-effort confirmation email (sent immediately; payment success updates state).
  mailService
    .orderConfirmation(req.user.email, {
      name: req.user.first_name,
      orderNumber,
      total: total.toLocaleString('en-US'),
    })
    .catch(() => {});

  res.status(201).json(
    api.success(
      {
        orderId,
        orderNumber,
        total,
        gatewayUrl: result.gatewayUrl,
        authority: result.authority,
      },
      null,
      'سفارش ایجاد شد. در حال انتقال به درگاه پرداخت...'
    )
  );
};

// Fetch a single order for the owner (used after payment redirect).
exports.order = async (req, res) => {
  const order = await orderModel.withItems(req.params.id);
  if (!order) throw ApiError.notFound('سفارش یافت نشد.');
  if (order.user_id !== req.user.id) throw ApiError.forbidden();
  res.json(api.success(order));
};

exports.orderByNumber = async (req, res) => {
  const order = await orderModel.byNumber(req.params.number);
  if (!order) throw ApiError.notFound('سفارش یافت نشد.');
  if (order.user_id !== req.user.id) throw ApiError.forbidden();
  const full = await orderModel.withItems(order.id);
  res.json(api.success(full));
};
