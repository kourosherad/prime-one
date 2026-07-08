/**
 * Prime One — category / listing page with filters + pagination.
 */
import { api } from '../api.js';
import { store } from '../bootstrap.js';
import { productCard, skeletonCard, emptyState, escapeHtml } from '../helpers.js';
import { persian } from '../persian.js';

const params = new URLSearchParams(location.search);
const state = {
  category: params.get('category') || '',
  q: params.get('q') || '',
  sort: params.get('sort') || 'newest',
  discount: params.get('discount') === 'true',
  minPrice: params.get('minPrice') || '',
  maxPrice: params.get('maxPrice') || '',
  page: 1,
  pageSize: 12,
  total: 0,
};

async function init() {
  if (window.AOS) window.AOS.init({ duration: 600, once: true });

  // Hydrate controls.
  document.getElementById('search-input').value = state.q;
  document.getElementById('sort').value = state.sort;
  document.getElementById('discount-only').checked = state.discount;
  document.getElementById('min-price').value = state.minPrice;
  document.getElementById('max-price').value = state.maxPrice;

  // Title for category.
  if (state.category) {
    try {
      const res = await api.get(`/api/catalog/categories/${encodeURIComponent(state.category)}`);
      if (res.data?.name) {
        document.getElementById('page-title').textContent = res.data.name;
        document.title = `${res.data.name} — Prime One`;
        document.getElementById('page-sub').textContent = res.data.description || '';
      }
    } catch {}
  } else if (state.q) {
    document.getElementById('page-title').textContent = `نتایج جستجو: «${state.q}»`;
  }

  // Wire events.
  document.getElementById('search-form').addEventListener('submit', (e) => {
    e.preventDefault();
    state.q = document.getElementById('search-input').value.trim();
    state.page = 1;
    updateUrl();
    load(reset = true);
  });
  document.getElementById('sort').addEventListener('change', (e) => {
    state.sort = e.target.value;
    state.page = 1;
    updateUrl();
    load(true);
  });
  document.getElementById('apply-filters').addEventListener('click', () => {
    state.minPrice = document.getElementById('min-price').value;
    state.maxPrice = document.getElementById('max-price').value;
    state.discount = document.getElementById('discount-only').checked;
    state.page = 1;
    updateUrl();
    load(true);
  });
  document.getElementById('reset-filters').addEventListener('click', () => {
    state.minPrice = state.maxPrice = '';
    state.discount = false;
    state.q = '';
    document.getElementById('min-price').value = '';
    document.getElementById('max-price').value = '';
    document.getElementById('discount-only').checked = false;
    document.getElementById('search-input').value = '';
    state.page = 1;
    updateUrl();
    load(true);
  });
  document.getElementById('load-more').addEventListener('click', () => {
    state.page += 1;
    load(false);
  });

  await load(true);
}

let reset = false;
async function load(doReset) {
  const grid = document.getElementById('products-grid');
  if (doReset) {
    grid.innerHTML = Array.from({ length: 8 }, () => skeletonCard()).join('');
    state.page = 1;
  }

  try {
    const res = await api.get('/api/catalog/products', {
      ...(state.category ? { category: state.category } : {}),
      ...(state.q ? { q: state.q } : {}),
      sort: state.sort,
      discount: state.discount ? 'true' : undefined,
      minPrice: state.minPrice || undefined,
      maxPrice: state.maxPrice || undefined,
      page: state.page,
      pageSize: state.pageSize,
    });
    const rows = res.data || [];
    state.total = res.meta?.total || rows.length;
    if (doReset || state.page === 1) {
      grid.innerHTML = rows.length ? rows.map(productCard).join('') : emptyState('محصولی با این مشخصات یافت نشد.');
    } else {
      grid.insertAdjacentHTML('beforeend', rows.map(productCard).join(''));
    }
    document.getElementById('results-info').textContent = `${persian.toFa(state.total)} محصول یافت شد`;
    const more = state.page * state.pageSize < state.total;
    document.getElementById('load-more-wrap').classList.toggle('hidden', !more);
    if (window.AOS) window.AOS.refresh();
  } catch (e) {
    grid.innerHTML = emptyState('بارگذاری ناموفق بود.', 'fa-triangle-exclamation');
  }
}

function updateUrl() {
  const p = new URLSearchParams();
  if (state.category) p.set('category', state.category);
  if (state.q) p.set('q', state.q);
  if (state.sort && state.sort !== 'newest') p.set('sort', state.sort);
  if (state.discount) p.set('discount', 'true');
  if (state.minPrice) p.set('minPrice', state.minPrice);
  if (state.maxPrice) p.set('maxPrice', state.maxPrice);
  history.replaceState(null, '', `?${p.toString()}`);
}

init();
