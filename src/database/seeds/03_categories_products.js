/**
 * Seed representative categories (parent groups + children) and ~20 sample products.
 *
 * The full category list from the brief is large; here we seed a representative
 * subset across the main groups so the storefront, filters, and admin all work.
 * The remaining categories can be added later via the admin UI — the schema and
 * category model support unlimited nesting.
 *
 * IDs are captured dynamically (not hard-coded) so re-seeding stays idempotent-ish.
 */
const { v4: uuidv4 } = require('uuid');

const slugify = (s) =>
  String(s)
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\u0600-\u06FFa-zA-Z0-9-]/g, '');

// Parent groups -> children. Each group becomes a featured parent category.
const CATEGORY_TREE = [
  {
    name: 'خرید اکانت هوش مصنوعی',
    icon: 'fa-robot',
    children: ['ChatGPT Plus', 'Claude Pro', 'Gemini Advanced', 'Midjourney'],
  },
  {
    name: 'خرید اکانت ابزارهای سئو',
    icon: 'fa-magnifying-glass-chart',
    children: ['Ahrefs', 'Semrush', 'Moz Pro'],
  },
  {
    name: 'اشتراک سرویس صوتی',
    icon: 'fa-music',
    children: ['خرید اکانت اسپاتیفای', 'خرید اکانت اپل موزیک', 'خرید اکانت تایدال', 'خرید اکانت دیزر'],
  },
  {
    name: 'اشتراک سرویس ویدیویی',
    icon: 'fa-film',
    children: ['فیلم و سریال', 'تلویزیون آنلاین', 'ورزشی', 'انیمه', 'کارتون', 'مستند'],
  },
  {
    name: 'اشتراک سرویس آموزشی',
    icon: 'fa-graduation-cap',
    children: ['آموزش زبان', 'آموزش موسیقی', 'آموزش برنامه‌نویسی', 'دوره‌های آموزشی', 'تحصیلی و دانشجویی', 'خرید دوره از Udemy'],
  },
  {
    name: 'گرافیک، طراحی و تدوین',
    icon: 'fa-pen-ruler',
    children: ['فایل استوک و فوتیج', 'عکاسی و فیلم‌برداری', 'خرید اکانت Freepik', 'خرید اکانت Envato', 'خرید اکانت PicsArt', 'خرید اکانت Canva'],
  },
  {
    name: 'اشتراک فضای ابری',
    icon: 'fa-cloud',
    children: ['Google One', 'Dropbox Plus', 'iCloud+'],
  },
  {
    name: 'شماره مجازی دائمی آمریکا',
    icon: 'fa-mobile-screen',
    children: [],
  },
];

// Sample products: keyed by parent category name they belong to.
const PRODUCTS = [
  // AI
  { cat: 'خرید اکانت هوش مصنوعی', title: 'اکانت ChatGPT Plus (یک ماهه)', code: 'AI-GPT-1M', price: 480000, discount: 390000, feat: true, best: true, hours: 1, features: { 'مدت اشتراک': '۱ ماه', 'تحویل': 'فوری (کمتر از ۱ ساعت)', 'گارانتی': 'تا پایان مدت' }, tags: ['هوش مصنوعی', 'ChatGPT', 'OpenAI'] },
  { cat: 'خرید اکانت هوش مصنوعی', title: 'اکانت Claude Pro (یک ماهه)', code: 'AI-CLAUDE-1M', price: 520000, discount: 450000, feat: true, best: false, hours: 1, features: { 'مدت اشتراک': '۱ ماه', 'تحویل': 'فوری', 'گارانتی': 'تا پایان مدت' }, tags: ['هوش مصنوعی', 'Claude', 'Anthropic'] },
  { cat: 'خرید اکانت هوش مصنوعی', title: 'اکانت Midjourney (یک ماهه)', code: 'AI-MJ-1M', price: 650000, discount: null, feat: false, best: false, hours: 2, features: { 'مدت اشتراک': '۱ ماه', 'پلن': 'Standard', 'تحویل': 'کمتر از ۲ ساعت' }, tags: ['هوش مصنوعی', 'Midjourney', 'تصویرسازی'] },

  // SEO
  { cat: 'خرید اکانت ابزارهای سئو', title: 'اکانت Ahrefs Standard (یک ماهه)', code: 'SEO-AHREFS-1M', price: 1200000, discount: 990000, feat: true, best: true, hours: 3, features: { 'پلن': 'Standard', 'مدت': '۱ ماه', 'تحویل': 'تا ۳ ساعت' }, tags: ['سئو', 'Ahrefs', 'بک‌لینک'] },
  { cat: 'خرید اکانت ابزارهای سئو', title: 'اکانت Semrush Pro (یک ماهه)', code: 'SEO-SEMRUSH-1M', price: 1100000, discount: null, feat: false, best: false, hours: 3, features: { 'پلن': 'Pro', 'مدت': '۱ ماه' }, tags: ['سئو', 'Semrush'] },

  // Audio
  { cat: 'خرید اکانت اسپاتیفای', title: 'اکانت Spotify Premium (یک ماهه)', code: 'MUS-SPOT-1M', price: 180000, discount: 145000, feat: true, best: true, hours: 1, features: { 'پلن': 'Premium Individual', 'مدت': '۱ ماه', 'تحویل': 'فوری' }, tags: ['موسیقی', 'Spotify'] },
  { cat: 'خرید اکانت اپل موزیک', title: 'اکانت Apple Music (یک ماهه)', code: 'MUS-APPMUS-1M', price: 210000, discount: null, feat: false, best: false, hours: 1, features: { 'مدت': '۱ ماه', 'تحویل': 'فوری' }, tags: ['موسیقی', 'Apple Music'] },
  { cat: 'خرید اکانت تایدال', title: 'اکانت TIDAL HiFi (یک ماهه)', code: 'MUS-TIDAL-1M', price: 240000, discount: 199000, feat: false, best: false, hours: 1, features: { 'پلن': 'HiFi', 'مدت': '۱ ماه' }, tags: ['موسیقی', 'TIDAL'] },

  // Video
  { cat: 'فیلم و سریال', title: 'اشتراک Netflix Premium (یک ماهه)', code: 'VID-NETFLIX-1M', price: 320000, discount: 269000, feat: true, best: true, hours: 1, features: { 'کیفیت': '4K UHD', 'مدت': '۱ ماه', 'تحویل': 'فوری' }, tags: ['ویدیو', 'Netflix'] },
  { cat: 'ورزشی', title: 'اشتراک ورزشی HD (یک ماهه)', code: 'VID-SPORT-1M', price: 260000, discount: null, feat: false, best: false, hours: 1, features: { 'کیفیت': 'Full HD', 'مدت': '۱ ماه' }, tags: ['ورزشی', 'استریم'] },

  // Education
  { cat: 'خرید دوره از Udemy', title: 'خرید دوره دلخواه از Udemy', code: 'EDU-UDEMY-1', price: 150000, discount: 99000, feat: true, best: true, hours: 4, features: { 'نوع': 'دوره تکی', 'تحویل': 'تا ۴ ساعت', 'گارانتی': 'دسترسی مادام‌العمر به فایل‌ها' }, tags: ['آموزش', 'Udemy'] },
  { cat: 'آموزش برنامه‌نویسی', title: 'دوره جامع برنامه‌نویسی (۳ ماهه)', code: 'EDU-DEV-3M', price: 850000, discount: 690000, feat: false, best: false, hours: 24, features: { 'مدت': '۳ ماه', 'پشتیبانی': 'داخل دوره' }, tags: ['آموزش', 'برنامه‌نویسی'] },

  // Design
  { cat: 'خرید اکانت Canva', title: 'اکانت Canva Pro (یک ماهه)', code: 'DES-CANVA-1M', price: 160000, discount: 120000, feat: true, best: true, hours: 1, features: { 'پلن': 'Pro', 'مدت': '۱ ماه', 'تحویل': 'فوری' }, tags: ['طراحی', 'Canva'] },
  { cat: 'خرید اکانت Freepik', title: 'اکانت Freepik Premium (یک ماهه)', code: 'DES-FREEPIK-1M', price: 190000, discount: null, feat: false, best: false, hours: 1, features: { 'پلن': 'Premium', 'مدت': '۱ ماه' }, tags: ['طراحی', 'Freepik'] },
  { cat: 'خرید اکانت Envato', title: 'اکانت Envato Elements (یک ماهه)', code: 'DES-ENVATO-1M', price: 380000, discount: 320000, feat: false, best: true, hours: 2, features: { 'پلن': 'Elements', 'مدت': '۱ ماه' }, tags: ['طراحی', 'Envato'] },
  { cat: 'خرید اکانت PicsArt', title: 'اکانت PicsArt Gold (یک ماهه)', code: 'DES-PICSART-1M', price: 140000, discount: null, feat: false, best: false, hours: 1, features: { 'پلن': 'Gold', 'مدت': '۱ ماه' }, tags: ['طراحی', 'PicsArt'] },

  // Cloud
  { cat: 'اشتراک فضای ابری', title: 'اشتراک Google One 2TB (یک ماهه)', code: 'CLD-GOOGLE-1M', price: 170000, discount: null, feat: false, best: false, hours: 1, features: { 'ظرفیت': '۲ ترابایت', 'مدت': '۱ ماه' }, tags: ['ابر', 'Google'] },

  // Virtual number
  { cat: 'شماره مجازی دائمی آمریکا', title: 'شماره مجازی دائمی آمریکا', code: 'NUM-US-PERM', price: 290000, discount: 240000, feat: true, best: true, hours: 2, features: { 'نوع': 'دائمی', 'کشور': 'آمریکا', 'تحویل': 'تا ۲ ساعت' }, tags: ['شماره مجازی', 'آمریکا'] },
  { cat: 'اشتراک سرویس ویدیویی', title: 'بسته چند سرویس ویدیویی (یک ماهه)', code: 'VID-BUNDLE-1M', price: 480000, discount: 390000, feat: false, best: false, hours: 2, features: { 'شامل': 'چندین سرویس', 'مدت': '۱ ماه' }, tags: ['ویدیو', 'بسته'] },
];

// Sample reviews: keyed by product code.
const REVIEWS = {
  'AI-GPT-1M': [
    { rating: 5, title: 'عالی و سریع', body: 'کمتر از نیم ساعت تحویل دادن. واقعا حرفه‌ای.' },
    { rating: 4, title: 'خوب بود', body: 'کیفیت خوب، فقط یکم گرونه.' },
  ],
  'MUS-SPOT-1M': [{ rating: 5, title: 'بی‌نقص', body: 'بدون قطعی، کیفیت عالی.' }],
  'VID-NETFLIX-1M': [{ rating: 5, title: 'کیفیت 4K واقعی', body: 'همه چی روان بود.' }],
  'DES-CANVA-1M': [{ rating: 4, title: 'کاربردی', body: 'برای طراح‌های آماتور عالیه.' }],
  'NUM-US-PERM': [{ rating: 5, title: 'شماره واقعا دائمی', body: 'بعد از چند ماه هم فعال هست.' }],
};

const SAMPLE_IMG = (seed) =>
  `https://picsum.photos/seed/${encodeURIComponent(seed)}/800/600`;

exports.seed = async (knex) => {
  const customer = await knex('users').where({ role: 'customer' }).first();
  const customerId = customer ? customer.id : 1;

  // ── Upsert categories ──
  const catIdByName = {};
  for (const group of CATEGORY_TREE) {
    const slug = slugify(group.name);
    let parent = await knex('categories').where({ slug }).first();
    if (!parent) {
      [parent] = await knex('categories').insert({
        name: group.name,
        slug,
        description: group.name,
        icon: group.icon,
        cover_image: SAMPLE_IMG('cat-' + slug),
        is_featured: true,
        sort_order: 0,
      });
      parent = await knex('categories').where({ id: parent[0] || parent }).first();
      // knex insert returns insertId array with mysql2 sometimes; normalize:
      if (!parent) {
        parent = await knex('categories').where({ slug }).first();
      }
    } else {
      await knex('categories').where({ id: parent.id }).update({
        icon: group.icon,
        cover_image: parent.cover_image || SAMPLE_IMG('cat-' + slug),
        is_featured: true,
      });
    }
    catIdByName[group.name] = parent.id;

    for (const childName of group.children) {
      const childSlug = slugify(childName);
      let child = await knex('categories').where({ slug: childSlug }).first();
      if (!child) {
        const ids = await knex('categories').insert({
          parent_id: parent.id,
          name: childName,
          slug: childSlug,
          description: childName,
          icon: group.icon,
          cover_image: SAMPLE_IMG('cat-' + childSlug),
          is_featured: false,
          sort_order: 0,
        });
        child = { id: ids[0], slug: childSlug };
      }
      catIdByName[childName] = child.id;
    }
  }

  // ── Upsert products ──
  for (const p of PRODUCTS) {
    const categoryId = catIdByName[p.cat];
    if (!categoryId) continue;
    const slug = slugify(p.title);
    const existing = await knex('products').where({ product_code: p.code }).first();

    const base = {
      category_id: categoryId,
      title: p.title,
      slug,
      description: p.title + ' — خرید امن و تحویل فوری از Prime One.',
      short_description: p.title,
      price: p.price,
      discount_price: p.discount || null,
      stock: 50,
      is_unlimited: false,
      product_code: p.code,
      main_image: SAMPLE_IMG(p.code),
      delivery_hours: p.hours,
      status: 'active',
      is_featured: !!p.feat,
      is_bestseller: !!p.best,
      seo_title: p.title,
      seo_description: p.title,
    };

    let productId;
    if (existing) {
      await knex('products').where({ id: existing.id }).update(base);
      productId = existing.id;
    } else {
      const ins = await knex('products').insert({ uuid: uuidv4(), ...base });
      productId = ins[0];
    }

    // tags
    await knex('product_tags').where({ product_id: productId }).delete();
    if (p.tags?.length) {
      await knex('product_tags').insert(
        p.tags.map((tag) => ({ product_id: productId, tag }))
      );
    }
    // features
    await knex('product_features').where({ product_id: productId }).delete();
    if (p.features) {
      const feats = Object.entries(p.features).map(([label, value], i) => ({
        product_id: productId,
        label,
        value,
        sort_order: i,
      }));
      await knex('product_features').insert(feats);
    }
    // gallery (2 sample images)
    await knex('product_images').where({ product_id: productId }).delete();
    await knex('product_images').insert([
      { product_id: productId, url: SAMPLE_IMG(p.code + '-1'), alt: p.title, sort_order: 0 },
      { product_id: productId, url: SAMPLE_IMG(p.code + '-2'), alt: p.title, sort_order: 1 },
    ]);

    // reviews
    const revs = REVIEWS[p.code] || [];
    await knex('reviews').where({ product_id: productId }).delete();
    if (revs.length && customerId) {
      for (const r of revs) {
        await knex('reviews').insert({
          product_id: productId,
          user_id: customerId,
          rating: r.rating,
          title: r.title,
          body: r.body,
          is_approved: true,
        }).catch(() => {}); // ignore unique-constraint if re-seeded
      }
    }
  }
};
