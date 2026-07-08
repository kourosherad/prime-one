const BaseModel = require('./base');
const db = require('../config/db');

class CouponModel extends BaseModel {
  constructor() {
    super('coupons');
  }

  findByCode(code) {
    return db('coupons').whereRaw('UPPER(code) = ?', [String(code).toUpperCase()]).first();
  }

  // Validate a coupon against a subtotal. Returns { valid, reason, discount }.
  evaluate(coupon, subtotal) {
    if (!coupon) return { valid: false, reason: 'کد تخفیف یافت نشد.' };
    if (!coupon.is_active) return { valid: false, reason: 'این کد غیرفعال است.' };
    const now = new Date();
    if (coupon.starts_at && new Date(coupon.starts_at) > now)
      return { valid: false, reason: 'این کد هنوز فعال نشده است.' };
    if (coupon.expires_at && new Date(coupon.expires_at) < now)
      return { valid: false, reason: 'این کد منقضی شده است.' };
    if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit)
      return { valid: false, reason: 'سقف استفاده از این کد تکمیل شده است.' };
    if (coupon.min_subtotal && Number(subtotal) < Number(coupon.min_subtotal))
      return {
        valid: false,
        reason: `حداقل خرید برای این کد ${coupon.min_subtotal} تومان است.`,
      };

    let discount = 0;
    if (coupon.type === 'percent') {
      discount = Math.round((Number(subtotal) * Number(coupon.value)) / 100);
      if (coupon.max_discount) discount = Math.min(discount, Number(coupon.max_discount));
    } else {
      discount = Number(coupon.value);
    }
    if (discount > subtotal) discount = subtotal;
    return { valid: true, discount };
  }

  incrementUsage(id) {
    return db('coupons').where({ id }).increment('used_count', 1);
  }
}

module.exports = new CouponModel();
module.exports.CouponModel = CouponModel;
