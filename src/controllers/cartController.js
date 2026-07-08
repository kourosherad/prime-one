/**
 * Cart controller: pricing/coupon preview. The cart items themselves are held
 * client-side (localStorage) and sent in the body for server-side validation.
 */
const { cartService } = require('../services/cartService');
const walletModel = require('../models/walletModel');
const { api } = require('../utils/response');

// Preview a cart: price items, apply coupon, compute wallet option.
exports.preview = async (req, res) => {
  const { items, couponCode, walletUse } = req.body;
  const wallet = req.user ? await walletModel.forUser(req.user.id) : null;
  const walletBalance = wallet ? Number(wallet.balance) : 0;
  const summary = await cartService.priceCart(items, {
    couponCode: couponCode || null,
    walletUse: walletUse || 0,
    walletBalance,
  });
  res.json(api.success(summary, { walletBalance }));
};

// Validate a coupon against a subtotal without requiring a full cart.
exports.applyCoupon = async (req, res) => {
  const { items, couponCode } = req.body;
  const summary = await cartService.priceCart(items, { couponCode });
  res.json(api.success(summary));
};
