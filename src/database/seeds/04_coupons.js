/**
 * Seed sample coupons.
 */
exports.seed = async (knex) => {
  const coupons = [
    { code: 'WELCOME10', type: 'percent', value: 10, min_subtotal: 100000, is_active: true },
    { code: 'PRIME20', type: 'percent', value: 20, min_subtotal: 500000, max_discount: 150000, is_active: true },
    { code: 'FLAT50K', type: 'fixed', value: 50000, min_subtotal: 300000, is_active: true },
  ];

  for (const c of coupons) {
    await knex('coupons')
      .insert({
        code: c.code,
        type: c.type,
        value: c.value,
        min_subtotal: c.min_subtotal || null,
        max_discount: c.max_discount || null,
        is_active: true,
      })
      .onConflict('code')
      .merge();
  }
};
