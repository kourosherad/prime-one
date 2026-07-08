/**
 * Prime One — product detail page.
 */
import { api, ApiError } from '../api.js';
import { store } from '../bootstrap.js';
import { fmtPrice, fmtNum, productCard, stars, escapeHtml, emptyState } from '../helpers.js';
import { persian } from '../persian.js';

const slug = new URLSearchParams(location.search).get('slug');

async function init() {
  if (window.AOS) window.AOS.init({ duration: 600, once: true });

  if (!slug) {
    renderError('محصول نامعتبر است.');
    return;
  }

  try {
    const res = await api.get(`/api/catalog/products/${encodeURIComponent(slug)}`);
    const p = res.data;
    document.title = `${p.title} — Prime One`;
    if (p.seo_description) document.querySelector('meta[name="description"]')?.setAttribute('content', p.seo_description);
    render(p);
    store.addRecent({ id: p.id, slug: p.slug, title: p.title, main_image: p.main_image });
    loadReviews(p.id);
  } catch (e) {
    renderError(e instanceof ApiError ? e.message : 'بارگذاری محصول ناموفق بود.');
  }
}

function render(p) {
  const root = document.getElementById('product-root');
  const price = p.effective_price ?? Number(p.price);
  const original = Number(p.price);
  const hasDiscount = p.discount_price && Number(p.discount_price) > 0 && Number(p.discount_price) < original;
  const pct = hasDiscount ? Math.round((1 - Number(p.discount_price) / original) * 100) : 0;

  const images = [p.main_image, ...(p.images || []).map((i) => i.url)].filter(Boolean);

  // Breadcrumbs
  document.getElementById('breadcrumbs').innerHTML = `
    <a href="/" class="hover:text-primary">خانه</a><i class="fa-solid fa-chevron-left text-[8px]"></i>
    <a href="/pages/category.html?category=${encodeURIComponent(p.category?.slug || '')}" class="hover:text-primary">${escapeHtml(p.category?.name || 'دسته‌بندی')}</a>
    <i class="fa-solid fa-chevron-left text-[8px]"></i><span class="text-ink dark:text-snow">${escapeHtml(p.title)}</span>`;

  root.innerHTML = `
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-8" data-aos="fade-up">
    <!-- Gallery -->
    <div>
      <div class="glass p-3 rounded-3xl overflow-hidden">
        <div class="swiper gallery-swiper rounded-2xl overflow-hidden">
          <div class="swiper-wrapper">
            ${images.map((src) => `<div class="swiper-slide aspect-square bg-black/5 dark:bg-white/5"><img src="${src}" alt="${escapeHtml(p.title)}" class="w-full h-full object-cover" loading="lazy"/></div>`).join('')}
          </div>
          <div class="swiper-pagination"></div>
        </div>
      </div>
      ${images.length > 1 ? `<div class="grid grid-cols-5 gap-2 mt-3">${images.slice(0, 5).map((src, i) => `<button class="gallery-thumb aspect-square rounded-xl overflow-hidden border-2 border-transparent hover:border-primary transition" data-index="${i}"><img src="${src}" class="w-full h-full object-cover" alt=""/></button>`).join('')}</div>` : ''}
    </div>

    <!-- Info -->
    <div>
      <div class="flex items-center gap-2 flex-wrap mb-2">
        ${hasDiscount ? `<span class="badge-discount">٪${persian.toFa(pct)} تخفیف</span>` : ''}
        <span class="chip"><i class="fa-solid fa-box text-primary"></i> کد: ${escapeHtml(p.product_code)}</span>
        ${p.delivery_hours ? `<span class="chip"><i class="fa-solid fa-bolt text-primary"></i> تحویل تا ${persian.toFa(p.delivery_hours)} ساعت</span>` : ''}
      </div>
      <h1 class="text-2xl md:text-3xl font-extrabold leading-9">${escapeHtml(p.title)}</h1>
      <div class="flex items-center gap-2 mt-2 text-sm text-mist">
        <div>${stars(p.rating?.average || 0)}</div>
        <span>(${persian.toFa(p.rating?.count || 0)} نظر)</span>
      </div>

      ${p.short_description ? `<p class="mt-4 text-mist leading-8">${escapeHtml(p.short_description)}</p>` : ''}

      <!-- Features -->
      ${p.features?.length ? `
      <div class="glass-sm p-4 mt-6">
        <h3 class="font-bold text-sm mb-3">ویژگی‌ها</h3>
        <ul class="space-y-2 text-sm">
          ${p.features.map((f) => `<li class="flex justify-between gap-4 py-1 border-b border-black/5 dark:border-white/5 last:border-0"><span class="text-mist">${escapeHtml(f.label)}</span><span class="font-medium">${escapeHtml(f.value || '—')}</span></li>`).join('')}
        </ul>
      </div>` : ''}

      <!-- Price + buy -->
      <div class="glass p-5 mt-6 sticky top-24">
        <div class="flex items-end justify-between gap-4">
          <div>
            ${hasDiscount ? `<div class="text-sm text-mist line-through">${fmtPrice(original)}</div>` : ''}
            <div class="text-3xl font-extrabold text-primary-700 dark:text-primary">${fmtPrice(price)}</div>
          </div>
          <div class="text-xs text-mist text-left">
            ${!p.is_unlimited ? `موجودی: ${persian.toFa(p.stock)}` : 'موجودی: نامحدود'}
          </div>
        </div>
        <div class="flex items-center gap-3 mt-5">
          <div class="flex items-center glass-sm rounded-xl overflow-hidden">
            <button id="qty-minus" class="w-10 h-11 grid place-items-center hover:bg-black/5 dark:hover:bg-white/10"><i class="fa-solid fa-minus text-xs"></i></button>
            <input id="qty" type="number" value="1" min="1" class="w-14 text-center bg-transparent outline-none font-bold" />
            <button id="qty-plus" class="w-10 h-11 grid place-items-center hover:bg-black/5 dark:hover:bg-white/10"><i class="fa-solid fa-plus text-xs"></i></button>
          </div>
          <button id="add-to-cart" class="btn-primary flex-1 !py-3"><i class="fa-solid fa-cart-plus"></i> افزودن به سبد</button>
        </div>
        <button id="buy-now" class="btn-dark w-full !py-3 mt-3"><i class="fa-solid fa-bolt"></i> خرید فوری</button>

        <div class="grid grid-cols-3 gap-2 mt-5 text-center text-[11px] text-mist">
          <div><i class="fa-solid fa-shield-halved text-primary block mb-1 text-base"></i> پرداخت امن</div>
          <div><i class="fa-solid fa-rotate text-primary block mb-1 text-base"></i> گارانتی</div>
          <div><i class="fa-solid fa-headset text-primary block mb-1 text-base"></i> پشتیبانی ۲۴/۷</div>
        </div>
      </div>
    </div>
  </div>

  <!-- Description -->
  ${p.description ? `
  <section class="mt-12" data-aos="fade-up">
    <h2 class="section-title mb-4">توضیحات</h2>
    <div class="glass p-6 leading-9 text-mist text-sm">${escapeHtml(p.description)}</div>
  </section>` : ''}

  <!-- Reviews -->
  <section class="mt-12" id="reviews-section" data-aos="fade-up">
    <div class="flex items-end justify-between mb-4">
      <h2 class="section-title">نظرات کاربران</h2>
    </div>
    <div id="reviews-list" class="space-y-3"></div>
    <form id="review-form" class="glass p-5 mt-6 hidden">
      <h3 class="font-bold mb-3">ثبت نظر شما</h3>
      <div class="flex items-center gap-1 mb-3" id="rating-stars">
        ${[1,2,3,4,5].map((i) => `<i data-rate="${i}" class="fa-star fa-regular text-2xl cursor-pointer hover:text-primary transition"></i>`).join('')}
      </div>
      <input type="text" name="title" placeholder="عنوان نظر" class="input mb-3" />
      <textarea name="body" rows="3" placeholder="نظر خود را بنویسید..." class="input mb-3"></textarea>
      <button class="btn-primary" type="submit">ارسال نظر</button>
    </form>
  </section>

  <!-- Related -->
  ${p.related?.length ? `
  <section class="mt-12" data-aos="fade-up">
    <h2 class="section-title mb-6">محصولات مرتبط</h2>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">${p.related.map(productCard).join('')}</div>
  </section>` : ''}
  `;

  // Wire interactions.
  let gallerySwiper;
  if (window.Swiper) {
    gallerySwiper = new window.Swiper('.gallery-swiper', { pagination: { el: '.swiper-pagination' }, loop: images.length > 1 });
  }
  document.querySelectorAll('.gallery-thumb').forEach((t) =>
    t.addEventListener('click', () => gallerySwiper?.slideToLoop(Number(t.dataset.index)))
  );

  const qtyEl = document.getElementById('qty');
  document.getElementById('qty-minus')?.addEventListener('click', () => (qtyEl.value = Math.max(1, +qtyEl.value - 1)));
  document.getElementById('qty-plus')?.addEventListener('click', () => (qtyEl.value = +qtyEl.value + 1));

  document.getElementById('add-to-cart')?.addEventListener('click', () => {
    store.addToCart(p.id, Math.max(1, +qtyEl.value || 1), {
      id: p.id, slug: p.slug, title: p.title, main_image: p.main_image, price,
    });
  });
  document.getElementById('buy-now')?.addEventListener('click', () => {
    store.clearCart();
    store.addToCart(p.id, Math.max(1, +qtyEl.value || 1), {
      id: p.id, slug: p.slug, title: p.title, main_image: p.main_image, price,
    });
    location.href = '/pages/checkout.html';
  });

  // Review form (only for logged-in users).
  const state = store.getState();
  if (state.user) {
    const form = document.getElementById('review-form');
    form.classList.remove('hidden');
    let rating = 5;
    form.querySelectorAll('#rating-stars i').forEach((s) => {
      s.addEventListener('click', () => {
        rating = Number(s.dataset.rate);
        form.querySelectorAll('#rating-stars i').forEach((x) => {
          const on = Number(x.dataset.rate) <= rating;
          x.classList.toggle('fa-solid', on);
          x.classList.toggle('fa-regular', !on);
          x.classList.toggle('text-primary', on);
        });
      });
    });
    form.querySelector('#rating-stars i').click();
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        await api.post(`/api/catalog/products/${p.id}/reviews`, {
          rating, title: form.title.value, body: form.body.value,
        });
        store.toast ? store.toast('نظر شما ثبت شد ✅', 'success') : null;
        form.reset();
        loadReviews(p.id);
      } catch (err) {
        (store.toast || console.error)(err.message);
      }
    });
  }
}

async function loadReviews(productId) {
  const list = document.getElementById('reviews-list');
  if (!list) return;
  try {
    const res = await api.get(`/api/catalog/products/${productId}/reviews`);
    const reviews = res.data || [];
    if (!reviews.length) {
      list.innerHTML = `<div class="glass-sm p-6 text-center text-mist text-sm">هنوز نظری ثبت نشده است.</div>`;
      return;
    }
    list.innerHTML = reviews
      .map(
        (r) => `
      <div class="glass-sm p-5">
        <div class="flex items-center justify-between gap-3 mb-2">
          <div class="flex items-center gap-2">
            <span class="w-9 h-9 rounded-lg bg-gradient-brand grid place-items-center font-bold text-ink">${escapeHtml((r.first_name || 'U').slice(0, 1))}</span>
            <span class="font-semibold text-sm">${escapeHtml(`${r.first_name || ''} ${r.last_name || ''}`.trim())}</span>
          </div>
          <div>${stars(r.rating)}</div>
        </div>
        ${r.title ? `<div class="font-bold text-sm mb-1">${escapeHtml(r.title)}</div>` : ''}
        <p class="text-sm text-mist leading-7">${escapeHtml(r.body || '')}</p>
      </div>`
      )
      .join('');
  } catch {}
}

function renderError(msg) {
  document.getElementById('product-root').innerHTML = emptyState(msg, 'fa-triangle-exclamation');
}

init();
