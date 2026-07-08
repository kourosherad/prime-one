/**
 * Prime One — frontend Persian formatting utilities (mirror of backend utils).
 */
export const persian = {
  toFa: (v) => String(v == null ? '' : v).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[+d]),
  toEn: (v) =>
    String(v == null ? '' : v)
      .replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d))
      .replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)),
  formatNumber: (v) => {
    const n = Number(v);
    if (Number.isNaN(n)) return '';
    return persian.toFa(n.toLocaleString('en-US'));
  },
  formatToman: (v) => `${persian.formatNumber(v)} تومان`,
};
