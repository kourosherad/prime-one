/**
 * Prime One — shared UI helpers (formatting, render fragments, components).
 */
import { persian } from './persian.js';

// Format price -> "۳۹۰٬۰۰۰ تومان"
export const fmtPrice = (n) => persian.formatToman(n);
export const fmtNum = (n) => persian.formatNumber(n);

// Percent discount badge value
export const discountPercent = (price, discount) => {
  if (!discount || !price || Number(discount) >= Number(price)) return 0;
  return Math.round((1 - Number(discount) / Number(price)) * 100);
};

// Effective price of a product object.
export const effectivePrice = (p) =>
  p && p.effective_price != null ? p.effective_price : Number(p?.discount_price || p?.price || 0);

// Skeleton card markup.
export const skeletonCard = () => `
  <div class="glass p-4">
    <div class="skeleton aspect-video w-full"></div>
    <div class="skeleton h-4 w-3/4 mt-4"></div>
    <div class="skeleton h-4 w-1/2 mt-2"></div>
    <div class="skeleton h-9 w-full mt-4"></div>
  </div>`;

// Product card markup.
export function productCard(p) {
  const price = effectivePrice(p);
  const original = Number(p.price || 0);
  const hasDiscount = p.discount_price && Number(p.discount_price) > 0 && Number(p.discount_price) < original;
  const pct = discountPercent(original, p.discount_price);
  return `
  <article class="product-card glass p-4 group transition-all duration-300 hover:-translate-y-1 hover:shadow-glow"
           data-aos="fade-up">
    <a href="/pages/product.html?slug=${encodeURIComponent(p.slug)}" class="block">
      <div class="relative aspect-video overflow-hidden rounded-xl bg-black/5 dark:bg-white/5">
        <img src="${p.main_image || p.image || ''}" alt="${escapeHtml(p.title)}"
             loading="lazy" decoding="async"
             class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ${hasDiscount ? `<span class="badge-discount absolute top-3 right-3">٪${persian.toFa(pct)} تخفیف</span>` : ''}
      </div>
      <h3 class="mt-4 font-semibold text-sm leading-6 line-clamp-2 min-h-[3rem]">${escapeHtml(p.title)}</h3>
      ${p.short_description ? `<p class="text-xs text-mist mt-1 line-clamp-1">${escapeHtml(p.short_description)}</p>` : ''}
    </a>
    <div class="mt-3 flex items-center justify-between gap-2">
      <div class="flex flex-col">
        ${hasDiscount ? `<span class="text-[11px] text-mist line-through">${fmtPrice(original)}</span>` : ''}
        <span class="font-bold text-primary-700 dark:text-primary">${fmtPrice(price)}</span>
      </div>
      <button type="button" data-add="${p.id}" data-product='${JSON.stringify(escapeProduct(p)).replace(/'/g, '&#39;')}'
              class="btn-primary !px-3 !py-2 text-xs">
        <i class="fa-solid fa-cart-plus"></i> افزودن
      </button>
    </div>
  </article>`;
}

function escapeProduct(p) {
  return { id: p.id, slug: p.slug, title: p.title, main_image: p.main_image, price: effectivePrice(p) };
}

export function escapeHtml(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Star rating renderer.
export function stars(rating = 0) {
  const r = Math.round(rating);
  let html = '';
  for (let i = 1; i <= 5; i++) {
    html += `<i class="fa-star ${i <= r ? 'fa-solid text-primary' : 'fa-regular text-mist/40'} text-xs"></i>`;
  }
  return html;
}

// Empty state.
export const emptyState = (message, icon = 'fa-box-open') => `
  <div class="col-span-full text-center py-16 text-mist">
    <i class="fa-solid ${icon} text-4xl mb-3 opacity-50"></i>
    <p>${message}</p>
  </div>`;

// Global click delegation for "add to cart" buttons.
export function bindAddToCart(store) {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-add]');
    if (!btn) return;
    e.preventDefault();
    const productId = Number(btn.getAttribute('data-add'));
    let product = null;
    try {
      product = JSON.parse(btn.getAttribute('data-product') || 'null');
    } catch {}
    store.addToCart(productId, 1, product);
  });
}
