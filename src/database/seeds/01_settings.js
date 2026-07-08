/**
 * Seed site settings (key/value). Safe to re-run.
 */
exports.seed = async (knex) => {
  const rows = [
    ['site.name', 'Prime One', 'general'],
    ['site.tagline', 'مرجع خرید اشتراک و سرویس‌های بین‌المللی', 'general'],
    ['site.description', 'خرید امن اشتراک و اکانت‌های بین‌المللی با تحویل فوری.', 'general'],
    ['site.logo_url', '/logo.png', 'general'],
    ['seo.title_default', 'Prime One | مرجع خرید اشتراک و سرویس‌های بین‌المللی', 'seo'],
    ['seo.description_default', 'خرید امن اشتراک و اکانت‌های بین‌المللی با تحویل فوری.', 'seo'],
    ['seo.keywords', 'اشتراک,اکانت,خرید اشتراک,سرویس بین المللی', 'seo'],
    ['contact.email', 'support@primeone.local', 'contact'],
    ['contact.phone', '', 'contact'],
    ['social.instagram', '#', 'contact'],
    ['social.telegram', '#', 'contact'],
    ['social.whatsapp', '#', 'contact'],
    ['currency', 'تومان', 'general'],
    ['maintenance.enabled', 'false', 'system'],
  ];

  for (const [key, value, group] of rows) {
    await knex('settings')
      .insert({ key, value, group, updated_at: knex.fn.now() })
      .onConflict('key')
      .merge();
  }
};
