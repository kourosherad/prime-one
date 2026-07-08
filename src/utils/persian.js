/**
 * Persian number conversion + currency formatting (Toman).
 */
const FA_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

const toFa = (value) =>
  String(value == null ? '' : value).replace(/\d/g, (d) => FA_DIGITS[+d]);

const toEn = (value) =>
  String(value == null ? '' : value)
    .replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d))
    .replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d));

// Group thousands with Persian separator and convert digits.
const formatNumber = (value) => {
  const n = Number(value);
  if (Number.isNaN(n)) return '';
  return toFa(n.toLocaleString('en-US'));
};

// Currency in Toman, e.g. ۳۹۰٬۰۰۰ تومان
const formatToman = (value) => `${formatNumber(value)} تومان`;

module.exports = { persian: { toFa, toEn, formatNumber, formatToman } };
