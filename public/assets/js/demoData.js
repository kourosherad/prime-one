/**
 * Prime One — static demo dataset.
 *
 * Used only in DEMO_MODE (e.g. GitHub Pages) so the storefront shows real
 * categories, products, and reviews without a backend. In normal (local/server)
 * mode, the real REST API is used instead.
 *
 * The content mirrors the database seed so what you see on Pages matches what
 * the app would serve when connected to MySQL.
 */

const img = (seed, w = 800, h = 600) =>
  `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}`;

export const CATEGORIES = [
  { id: 1, name: 'خرید اکانت هوش مصنوعی', slug: 'buy-ai-account', icon: 'fa-robot', parent_id: null, is_featured: true, description: 'خرید امن اشتراک هوش مصنوعی', cover_image: img('cat-ai') },
  { id: 2, name: 'خرید اکانت ابزارهای سئو', slug: 'buy-seo-tools', icon: 'fa-magnifying-glass-chart', parent_id: null, is_featured: true, description: 'ابزارهای حرفه‌ای سئو', cover_image: img('cat-seo') },
  { id: 3, name: 'اشتراک سرویس صوتی', slug: 'audio-service', icon: 'fa-music', parent_id: null, is_featured: true, description: 'موزیک و پادکست', cover_image: img('cat-audio') },
  { id: 4, name: 'اشتراک سرویس ویدیویی', slug: 'video-service', icon: 'fa-film', parent_id: null, is_featured: true, description: 'فیلم، سریال، ورزشی', cover_image: img('cat-video') },
  { id: 5, name: 'اشتراک سرویس آموزشی', slug: 'education-service', icon: 'fa-graduation-cap', parent_id: null, is_featured: true, description: 'دوره و آموزش', cover_image: img('cat-edu') },
  { id: 6, name: 'گرافیک، طراحی و تدوین', slug: 'graphic-design', icon: 'fa-pen-ruler', parent_id: null, is_featured: true, description: 'ابزار طراحی', cover_image: img('cat-design') },
  { id: 7, name: 'اشتراک فضای ابری', slug: 'cloud-storage', icon: 'fa-cloud', parent_id: null, is_featured: true, description: 'فضای ابری', cover_image: img('cat-cloud') },
  { id: 8, name: 'شماره مجازی دائمی آمریکا', slug: 'us-virtual-number', icon: 'fa-mobile-screen', parent_id: null, is_featured: true, description: 'شماره مجازی', cover_image: img('cat-num') },
];

export const PRODUCTS = [
  { id: 1, category_id: 1, title: 'اکانت ChatGPT Plus (یک ماهه)', slug: 'chatgpt-plus-1m', product_code: 'AI-GPT-1M', price: 480000, discount_price: 390000, main_image: img('AI-GPT-1M'), short_description: 'دسترسی کامل به GPT-4، تحویل فوری', status: 'active', is_featured: true, is_bestseller: true, delivery_hours: 1, stock: 50, effective_price: 390000, category: { slug: 'buy-ai-account', name: 'هوش مصنوعی' } },
  { id: 2, category_id: 1, title: 'اکانت Claude Pro (یک ماهه)', slug: 'claude-pro-1m', product_code: 'AI-CLAUDE-1M', price: 520000, discount_price: 450000, main_image: img('AI-CLAUDE-1M'), short_description: 'دستیار هوشمند Anthropic', status: 'active', is_featured: true, is_bestseller: false, delivery_hours: 1, stock: 50, effective_price: 450000, category: { slug: 'buy-ai-account', name: 'هوش مصنوعی' } },
  { id: 3, category_id: 1, title: 'اکانت Midjourney (یک ماهه)', slug: 'midjourney-1m', product_code: 'AI-MJ-1M', price: 650000, discount_price: null, main_image: img('AI-MJ-1M'), short_description: 'تصویرسازی با هوش مصنوعی', status: 'active', is_featured: false, is_bestseller: false, delivery_hours: 2, stock: 50, effective_price: 650000, category: { slug: 'buy-ai-account', name: 'هوش مصنوعی' } },
  { id: 4, category_id: 2, title: 'اکانت Ahrefs Standard (یک ماهه)', slug: 'ahrefs-standard-1m', product_code: 'SEO-AHREFS-1M', price: 1200000, discount_price: 990000, main_image: img('SEO-AHREFS-1M'), short_description: 'قدرتمندترین ابزار سئو', status: 'active', is_featured: true, is_bestseller: true, delivery_hours: 3, stock: 50, effective_price: 990000, category: { slug: 'buy-seo-tools', name: 'سئو' } },
  { id: 5, category_id: 2, title: 'اکانت Semrush Pro (یک ماهه)', slug: 'semrush-pro-1m', product_code: 'SEO-SEMRUSH-1M', price: 1100000, discount_price: null, main_image: img('SEO-SEMRUSH-1M'), short_description: 'تحلیل و رقابت سئو', status: 'active', is_featured: false, is_bestseller: false, delivery_hours: 3, stock: 50, effective_price: 1100000, category: { slug: 'buy-seo-tools', name: 'سئو' } },
  { id: 6, category_id: 3, title: 'اکانت Spotify Premium (یک ماهه)', slug: 'spotify-premium-1m', product_code: 'MUS-SPOT-1M', price: 180000, discount_price: 145000, main_image: img('MUS-SPOT-1M'), short_description: 'موزیک بدون تبلیغ، کیفیت بالا', status: 'active', is_featured: true, is_bestseller: true, delivery_hours: 1, stock: 50, effective_price: 145000, category: { slug: 'audio-service', name: 'صوتی' } },
  { id: 7, category_id: 3, title: 'اکانت Apple Music (یک ماهه)', slug: 'apple-music-1m', product_code: 'MUS-APPMUS-1M', price: 210000, discount_price: null, main_image: img('MUS-APPMUS-1M'), short_description: 'بیشتر از ۱۰۰ میلیون آهنگ', status: 'active', is_featured: false, is_bestseller: false, delivery_hours: 1, stock: 50, effective_price: 210000, category: { slug: 'audio-service', name: 'صوتی' } },
  { id: 8, category_id: 3, title: 'اکانت TIDAL HiFi (یک ماهه)', slug: 'tidal-hifi-1m', product_code: 'MUS-TIDAL-1M', price: 240000, discount_price: 199000, main_image: img('MUS-TIDAL-1M'), short_description: 'کیفیت صوتی بدون افت', status: 'active', is_featured: false, is_bestseller: false, delivery_hours: 1, stock: 50, effective_price: 199000, category: { slug: 'audio-service', name: 'صوتی' } },
  { id: 9, category_id: 4, title: 'اشتراک Netflix Premium (یک ماهه)', slug: 'netflix-premium-1m', product_code: 'VID-NETFLIX-1M', price: 320000, discount_price: 269000, main_image: img('VID-NETFLIX-1M'), short_description: 'کیفیت 4K UHD، چند کاربره', status: 'active', is_featured: true, is_bestseller: true, delivery_hours: 1, stock: 50, effective_price: 269000, category: { slug: 'video-service', name: 'ویدیویی' } },
  { id: 10, category_id: 4, title: 'اشتراک ورزشی HD (یک ماهه)', slug: 'sports-hd-1m', product_code: 'VID-SPORT-1M', price: 260000, discount_price: null, main_image: img('VID-SPORT-1M'), short_description: 'پخش زنده مسابقات', status: 'active', is_featured: false, is_bestseller: false, delivery_hours: 1, stock: 50, effective_price: 260000, category: { slug: 'video-service', name: 'ویدیویی' } },
  { id: 11, category_id: 5, title: 'خرید دوره دلخواه از Udemy', slug: 'udemy-course', product_code: 'EDU-UDEMY-1', price: 150000, discount_price: 99000, main_image: img('EDU-UDEMY-1'), short_description: 'هر دوره‌ای که بخواهید', status: 'active', is_featured: true, is_bestseller: true, delivery_hours: 4, stock: 99, effective_price: 99000, category: { slug: 'education-service', name: 'آموزشی' } },
  { id: 12, category_id: 5, title: 'دوره جامع برنامه‌نویسی (۳ ماهه)', slug: 'programming-course-3m', product_code: 'EDU-DEV-3M', price: 850000, discount_price: 690000, main_image: img('EDU-DEV-3M'), short_description: 'از صفر تا حرفه‌ای', status: 'active', is_featured: false, is_bestseller: false, delivery_hours: 24, stock: 50, effective_price: 690000, category: { slug: 'education-service', name: 'آموزشی' } },
  { id: 13, category_id: 6, title: 'اکانت Canva Pro (یک ماهه)', slug: 'canva-pro-1m', product_code: 'DES-CANVA-1M', price: 160000, discount_price: 120000, main_image: img('DES-CANVA-1M'), short_description: 'طراحی حرفه‌ای آسان', status: 'active', is_featured: true, is_bestseller: true, delivery_hours: 1, stock: 50, effective_price: 120000, category: { slug: 'graphic-design', name: 'طراحی' } },
  { id: 14, category_id: 6, title: 'اکانت Freepik Premium (یک ماهه)', slug: 'freepik-premium-1m', product_code: 'DES-FREEPIK-1M', price: 190000, discount_price: null, main_image: img('DES-FREEPIK-1M'), short_description: 'هزاران فایل آماده', status: 'active', is_featured: false, is_bestseller: false, delivery_hours: 1, stock: 50, effective_price: 190000, category: { slug: 'graphic-design', name: 'طراحی' } },
  { id: 15, category_id: 6, title: 'اکانت Envato Elements (یک ماهه)', slug: 'envato-elements-1m', product_code: 'DES-ENVATO-1M', price: 380000, discount_price: 320000, main_image: img('DES-ENVATO-1M'), short_description: 'تم، قالب و فایل گرافیکی', status: 'active', is_featured: false, is_bestseller: true, delivery_hours: 2, stock: 50, effective_price: 320000, category: { slug: 'graphic-design', name: 'طراحی' } },
  { id: 16, category_id: 6, title: 'اکانت PicsArt Gold (یک ماهه)', slug: 'picsart-gold-1m', product_code: 'DES-PICSART-1M', price: 140000, discount_price: null, main_image: img('DES-PICSART-1M'), short_description: 'ویرایش پیشرفته عکس', status: 'active', is_featured: false, is_bestseller: false, delivery_hours: 1, stock: 50, effective_price: 140000, category: { slug: 'graphic-design', name: 'طراحی' } },
  { id: 17, category_id: 7, title: 'اشتراک Google One 2TB (یک ماهه)', slug: 'google-one-2tb-1m', product_code: 'CLD-GOOGLE-1M', price: 170000, discount_price: null, main_image: img('CLD-GOOGLE-1M'), short_description: 'فضای ابری امن', status: 'active', is_featured: false, is_bestseller: false, delivery_hours: 1, stock: 50, effective_price: 170000, category: { slug: 'cloud-storage', name: 'ابر' } },
  { id: 18, category_id: 8, title: 'شماره مجازی دائمی آمریکا', slug: 'us-virtual-number-permanent', product_code: 'NUM-US-PERM', price: 290000, discount_price: 240000, main_image: img('NUM-US-PERM'), short_description: 'شماره واقعی و دائمی', status: 'active', is_featured: true, is_bestseller: true, delivery_hours: 2, stock: 50, effective_price: 240000, category: { slug: 'us-virtual-number', name: 'شماره مجازی' } },
  { id: 19, category_id: 4, title: 'بسته چند سرویس ویدیویی (یک ماهه)', slug: 'video-bundle-1m', product_code: 'VID-BUNDLE-1M', price: 480000, discount_price: 390000, main_image: img('VID-BUNDLE-1M'), short_description: 'چندین سرویس با هم', status: 'active', is_featured: false, is_bestseller: false, delivery_hours: 2, stock: 50, effective_price: 390000, category: { slug: 'video-service', name: 'ویدیویی' } },
];

const REVIEWS = {
  'chatgpt-plus-1m': [
    { id: 1, rating: 5, title: 'عالی و سریع', body: 'کمتر از نیم ساعت تحویل دادن. واقعا حرفه‌ای.', first_name: 'علی', last_name: 'ر', created_at: '2026-06-01' },
    { id: 2, rating: 4, title: 'خوب بود', body: 'کیفیت خوب، فقط یکم گرونه.', first_name: 'مریم', last_name: 'ح', created_at: '2026-06-10' },
  ],
  'spotify-premium-1m': [{ id: 3, rating: 5, title: 'بی‌نقص', body: 'بدون قطعی، کیفیت عالی.', first_name: 'سینا', last_name: 'ک', created_at: '2026-06-05' }],
  'netflix-premium-1m': [{ id: 4, rating: 5, title: 'کیفیت 4K واقعی', body: 'همه چی روان بود.', first_name: 'نگار', last_name: 'م', created_at: '2026-06-12' }],
  'canva-pro-1m': [{ id: 5, rating: 4, title: 'کاربردی', body: 'برای طراح‌های آماتور عالیه.', first_name: 'بهروز', last_name: 'ن', created_at: '2026-06-08' }],
  'us-virtual-number-permanent': [{ id: 6, rating: 5, title: 'شماره واقعا دائمی', body: 'بعد از چند ماه هم فعال هست.', first_name: 'سارا', last_name: 'ت', created_at: '2026-06-15' }],
};

const productDetail = (p) => {
  const related = PRODUCTS.filter((x) => x.category_id === p.category_id && x.id !== p.id).slice(0, 4);
  const reviews = REVIEWS[p.slug] || [];
  const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
  return {
    ...p,
    description: `${p.title} — خرید امن و تحویل فوری از Prime One. گارانتی تا پایان مدت اشتراک، پشتیبانی واقعی و پرداخت از طریق درگاه امن زرین‌پال.`,
    features: [
      { label: 'مدت اشتراک', value: 'یک ماه', sort_order: 0 },
      { label: 'زمان تحویل', value: `کمتر از ${p.delivery_hours} ساعت`, sort_order: 1 },
      { label: 'گارانتی', value: 'تا پایان مدت', sort_order: 2 },
    ],
    faqs: [
      { question: 'چقدر طول می‌کشد فعال شود؟', answer: `کمتر از ${p.delivery_hours} ساعت.` },
      { question: 'آیا گارانتی دارد؟', answer: 'بله، تا پایان مدت اشتراک گارانتی دارد.' },
    ],
    tags: p.title.split(' ').slice(0, 3),
    images: [{ url: img(p.product_code + '-1') }, { url: img(p.product_code + '-2') }],
    related,
    rating: { average: Math.round(avg * 10) / 10, count: reviews.length },
  };
};

/**
 * Demo API: handles the catalog GETs the storefront needs. Returns a promise
 * resolving to the same envelope shape as the real backend ({ success, data, meta }).
 */
export const demoApi = (path, query = {}) => {
  const envelope = (data, meta) => ({ success: true, data, meta });

  // Homepage aggregates.
  if (path === '/api/catalog') {
    return Promise.resolve(
      envelope({
        featured: PRODUCTS.filter((p) => p.is_featured).slice(0, 8),
        newest: [...PRODUCTS].sort((a, b) => b.id - a.id).slice(0, 8),
        bestsellers: PRODUCTS.filter((p) => p.is_bestseller).slice(0, 8),
        discounted: PRODUCTS.filter((p) => p.discount_price).slice(0, 8),
        categories: CATEGORIES,
      })
    );
  }

  if (path === '/api/catalog/categories') return Promise.resolve(envelope(CATEGORIES));
  if (path === '/api/catalog/categories/tree')
    return Promise.resolve(envelope(CATEGORIES.map((c) => ({ ...c, children: [] }))));

  const catMatch = path.match(/^\/api\/catalog\/categories\/(.+)$/);
  if (catMatch) {
    const cat = CATEGORIES.find((c) => c.slug === catMatch[1]);
    return Promise.resolve(envelope(cat ? { ...cat, children: [] } : null));
  }

  // Product detail by slug.
  const slugMatch = path.match(/^\/api\/catalog\/products\/(.+)$/);
  if (slugMatch) {
    const p = PRODUCTS.find((x) => x.slug === slugMatch[1]);
    return Promise.resolve(envelope(p ? productDetail(p) : null));
  }

  // Product list with filters.
  if (path === '/api/catalog/products') {
    let rows = [...PRODUCTS];
    if (query.category) rows = rows.filter((p) => p.category.slug === query.category);
    if (query.q) {
      const q = query.q.toLowerCase();
      rows = rows.filter(
        (p) => p.title.toLowerCase().includes(q) || p.product_code.toLowerCase().includes(q)
      );
    }
    if (query.discount === 'true') rows = rows.filter((p) => p.discount_price);
    if (query.minPrice) rows = rows.filter((p) => p.price >= +query.minPrice);
    if (query.maxPrice) rows = rows.filter((p) => p.price <= +query.maxPrice);
    switch (query.sort) {
      case 'price_asc': rows.sort((a, b) => a.price - b.price); break;
      case 'price_desc': rows.sort((a, b) => b.price - a.price); break;
      default: rows.sort((a, b) => b.id - a.id);
    }
    const page = +query.page || 1;
    const pageSize = +query.pageSize || 12;
    const total = rows.length;
    const slice = rows.slice((page - 1) * pageSize, page * pageSize);
    return Promise.resolve(envelope(slice, { total, page, pageSize, totalPages: Math.ceil(total / pageSize) }));
  }

  // Reviews.
  const revMatch = path.match(/^\/api\/catalog\/products\/(\d+)\/reviews$/);
  if (revMatch) {
    const pid = +revMatch[1];
    const product = PRODUCTS.find((p) => p.id === pid);
    const reviews = product ? REVIEWS[product.slug] || [] : [];
    const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
    return Promise.resolve(envelope(reviews, { average: Math.round(avg * 10) / 10, count: reviews.length }));
  }

  // Auth: never logged in on demo.
  if (path === '/api/auth/me') return Promise.resolve(envelope({ user: null }));

  // Wallet / cart preview: demo-friendly defaults.
  if (path === '/api/cart/preview' || path === '/api/cart/coupon') {
    return Promise.resolve(envelope({ items: [], subtotal: 0, discount: 0, walletUsed: 0, total: 0, coupon: null }));
  }
  if (path === '/api/account/wallet') return Promise.resolve(envelope({ balance: 0 }));

  // Default: empty success.
  return Promise.resolve(envelope(null));
};
