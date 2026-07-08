/**
 * Payment gateway factory + the paymentService orchestrator.
 *
 * The factory returns a gateway by name (default 'zarinpal'). Add new gateways
 * here once their classes exist; controllers stay gateway-agnostic.
 */
const ZarinPalGateway = require('./ZarinPalGateway');
const db = require('../../config/db');
const env = require('../../config/env');
const logger = require('../../config/logger');
const orderModel = require('../../models/orderModel');
const transactionModel = require('../../models/transactionModel');
const walletModel = require('../../models/walletModel');
const notificationModel = require('../../models/notificationModel');
const { random } = require('../../utils/random');
const { TRANSACTION_TYPE, PAYMENT_STATUS, ORDER_STATUS } = require('../../config/constants');
const ApiError = require('../../utils/apiError');

const gateways = {
  zarinpal: new ZarinPalGateway(),
};

const getGateway = (name = 'zarinpal') => {
  const g = gateways[name];
  if (!g) throw ApiError.internal(`Unknown payment gateway: ${name}`);
  return g;
};

/**
 * High-level payment service: creates a transaction, asks the gateway for an
 * authority, persists it, and returns the redirect URL.
 */
const initiate = async ({ orderId, userId, amount, description, gatewayName = 'zarinpal', meta = {} }) => {
  const gateway = getGateway(gatewayName);
  const callbackUrl = `${env.app.url}${env.zarinpal.callbackPath}`;
  const trackingCode = random.trackingCode();

  // Create a pending transaction first.
  const tx = await transactionModel.create({
    tracking_code: trackingCode,
    order_id: orderId || null,
    user_id: userId,
    gateway: gateway.name,
    type: TRANSACTION_TYPE.PAYMENT,
    status: PAYMENT_STATUS.PENDING,
    amount,
    description: description || null,
  });

  try {
    const res = await gateway.createPayment({
      amount,
      description: description || `سفارش ${trackingCode}`,
      callbackUrl: `${callbackUrl}?track=${trackingCode}`,
      ...(meta.mobile ? { mobile: meta.mobile } : {}),
      ...(meta.email ? { email: meta.email } : {}),
    });

    await transactionModel.update(tx.id, { authority: res.authority });
    return { trackingCode, authority: res.authority, gatewayUrl: res.gatewayUrl };
  } catch (err) {
    logger.error(`[payment] initiate failed: ${err.message}`);
    await transactionModel.markFailed(tx.id, { gatewayResponse: { error: err.message } });
    throw ApiError.internal('شروع پرداخت ناموفق بود. لطفاً دوباره تلاش کنید.');
  }
};

/**
 * Verify the callback. Looks up the transaction by tracking code, verifies
 * with the gateway, and on success marks order + transaction paid (and applies
 * wallet debit if any was used). Returns a result object for the controller.
 */
const verify = async ({ trackingCode, authority, status }) => {
  const tx = await transactionModel.byTracking(trackingCode);
  if (!tx) throw ApiError.notFound('تراکنش یافت نشد.');
  if (tx.status === PAYMENT_STATUS.PAID) {
    return { alreadyPaid: true, orderNumber: (await orderModel.findById(tx.order_id))?.order_number };
  }
  if (status === 'NOK') {
    await transactionModel.markFailed(tx.id, { gatewayResponse: { status } });
    return { failed: true };
  }

  const gateway = getGateway(tx.gateway);
  const result = await gateway.verifyPayment({ authority: authority || tx.authority, amount: tx.amount });
  if (!result.success) {
    await transactionModel.markFailed(tx.id, { gatewayResponse: result.raw });
    return { failed: true, raw: result.raw };
  }

  await db.transaction(async (trx) => {
    await trx('transactions')
      .where({ id: tx.id })
      .update({
        status: PAYMENT_STATUS.PAID,
        reference_id: result.referenceId,
        gateway_response: JSON.stringify(result.raw),
        paid_at: db.fn.now(),
        updated_at: db.fn.now(),
      });

    if (tx.order_id) {
      await trx('orders').where({ id: tx.order_id }).update({
        status: ORDER_STATUS.PAID,
        paid_at: db.fn.now(),
        updated_at: db.fn.now(),
      });
    }
  });

  // Debit wallet if used (recorded on order.wallet_used). Best-effort.
  if (tx.order_id) {
    const order = await orderModel.findById(tx.order_id);
    if (order && Number(order.wallet_used) > 0) {
      const wallet = await walletModel.forUser(tx.user_id);
      if (wallet) {
        await walletModel
          .apply(wallet.id, 'debit', order.wallet_used, `پرداخت سفارش ${order.order_number}`, tx.id)
          .catch((e) => logger.error(`[payment] wallet debit failed: ${e.message}`));
      }
    }
    // Notify customer.
    const order2 = await orderModel.findById(tx.order_id);
    await notificationModel
      .send(tx.user_id, {
        type: 'payment_success',
        title: 'پرداخت موفق',
        body: `سفارش ${order2.order_number} با موفقیت پرداخت شد.`,
        link: '/pages/account.html?tab=orders',
      })
      .catch(() => {});
  }

  return { success: true, referenceId: result.referenceId };
};

module.exports = { paymentService: { getGateway, initiate, verify, gateways } };
