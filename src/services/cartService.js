/**
 * Cart service. Carts live in the DB-less layer as server-side state per session:
 * we store the guest/customer cart in the `carts` JSON via a small `cart_sessions`
 * table? To keep Phase 1 lean, carts are held client-side (localStorage) and the
 * server only computes totals + validates items at checkout / coupon apply.
 *
 * This service validates a cart payload [{ productId, quantity }] and returns
 * a priced summary with effective prices, stock checks, coupon + wallet math.
 */
const productModel = require('../models/productModel');
const couponModel = require('../models/couponModel');
const { ProductModel } = productModel;
const ApiError = require('../utils/apiError');

/**
 * Validate + price a cart. Returns { items, subtotal, discount, walletUsed, total }.
 * Throws ApiError if an item is unavailable / out of stock.
 */
const priceCart = async (items, { couponCode = null, walletUse = 0, walletBalance = 0 } = {}) => {
  if (!Array.isArray(items) || items.length === 0) {
    throw ApiError.badRequest('سبد خرید خالی است.');
  }

  const priced = [];
  for (const it of items) {
    const qty = Math.max(1, parseInt(it.quantity, 10) || 1);
    const product = await productModel.findById(it.productId);
    if (!product || product.status !== 'active') {
      throw ApiError.badRequest(`محصول با شناسه ${it.productId} در دسترس نیست.`);
    }
    if (!product.is_unlimited && product.stock < qty) {
      throw ApiError.badRequest(`موجودی «${product.title}» کافی نیست.`);
    }
    const unit = ProductModel.effectivePrice(product);
    priced.push({
      productId: product.id,
      slug: product.slug,
      title: product.title,
      productCode: product.product_code,
      image: product.main_image,
      unitPrice: unit,
      originalPrice: Number(product.price),
      quantity: qty,
      lineTotal: unit * qty,
    });
  }

  const subtotal = priced.reduce((s, i) => s + i.lineTotal, 0);
  let discount = 0;
  let coupon = null;
  let couponEval = { valid: false };
  if (couponCode) {
    coupon = await couponModel.findByCode(couponCode);
    couponEval = couponModel.evaluate(coupon, subtotal);
    if (couponEval.valid) discount = couponEval.discount;
  }

  let walletUsed = 0;
  const requestedWallet = Math.max(0, Math.min(Number(walletUse || 0), Number(walletBalance || 0)));
  const afterDiscount = Math.max(0, subtotal - discount);
  walletUsed = Math.min(requestedWallet, afterDiscount);

  const total = Math.max(0, afterDiscount - walletUsed);

  return {
    items: priced,
    subtotal,
    discount,
    walletUsed,
    total,
    coupon: coupon
      ? { code: coupon.code, type: coupon.type, value: coupon.value, valid: couponEval.valid, reason: couponEval.reason }
      : null,
  };
};

module.exports = { cartService: { priceCart } };
