/**
 * Prime One — cart page.
 */
import { api } from '../api.js';
import { store } from '../bootstrap.js';
import { fmtPrice, escapeHtml, emptyState } from '../helpers.js';
import { persian } from '../persian.js';
import { subscribe } from '../store.js';

let lastSummary = null;

async function init() {
  render();
  subscribe(render);
}

async function render() {
  const cart = store.getCart();
  const itemsHost = document.getElementById('cart-items');
  const summaryHost = document.getElementById('cart-summary');

  if (!cart.length) {
    itemsHost.innerHTML = emptyState('سبد خرید شما خالی است.', 'fa-cart-shopping');
    summaryHost.innerHTML = `<a href="/" class="btn-primary w-full">شروع خرید</a>`;
    return;
  }

  // Show local items immediately (optimistic).
  itemsHost.innerHTML = cart
    .map(
      (it) => `
    <div class="glass p-4 flex items-center gap-4">
      <img src="${it.product?.main_image || ''}" alt="" class="w-20 h-20 rounded-xl object-cover bg-black/5" />
      <div class="flex-1 min-w-0">
        <a href="/pages/product.html?slug=${encodeURIComponent(it.product?.slug || '')}" class="font-semibold text-sm line-clamp-1 hover:text-primary">${escapeHtml(it.product?.title || 'محصول')}</a>
        <div class="text-xs text-mist mt-1">${it.product?.price ? fmtPrice(it.product.price) : ''}</div>
        <div class="flex items-center gap-2 mt-2 glass-sm rounded-lg overflow-hidden w-fit">
          <button data-qty-minus="${it.productId}" class="w-8 h-8 grid place-items-center hover:bg-black/5 dark:hover:bg-white/10"><i class="fa-solid fa-minus text-[10px]"></i></button>
          <span class="w-8 text-center text-sm font-bold">${persian.toFa(it.quantity)}</span>
          <button data-qty-plus="${it.productId}" class="w-8 h-8 grid place-items-center hover:bg-black/5 dark:hover:bg-white/10"><i class="fa-solid fa-plus text-[10px]"></i></button>
        </div>
      </div>
      <button data-remove="${it.productId}" class="w-9 h-9 rounded-lg grid place-items-center text-red-500 hover:bg-red-500/10 transition" aria-label="حذف"><i class="fa-solid fa-trash"></i></button>
    </div>`
    )
    .join('');

  // Wire qty/remove.
  itemsHost.querySelectorAll('[data-qty-minus]').forEach((b) =>
    b.addEventListener('click', () => {
      const it = cart.find((i) => i.productId === Number(b.dataset.qtyMinus));
      if (it) store.updateQty(it.productId, it.quantity - 1);
    })
  );
  itemsHost.querySelectorAll('[data-qty-plus]').forEach((b) =>
    b.addEventListener('click', () => {
      const it = cart.find((i) => i.productId === Number(b.dataset.qtyPlus));
      if (it) store.updateQty(it.productId, it.quantity + 1);
    })
  );
  itemsHost.querySelectorAll('[data-remove]').forEach((b) =>
    b.addEventListener('click', () => store.removeFromCart(Number(b.dataset.remove)))
  );

  summaryHost.innerHTML = `
    <h3 class="font-bold mb-4">خلاصه سفارش</h3>
    <div id="summary-lines" class="text-sm text-mist space-y-2 mb-4">در حال محاسبه...</div>
    <div class="flex gap-2 mb-4">
      <input id="coupon-input" placeholder="کد تخفیف" class="input text-sm" value="${lastSummary?.coupon?.valid ? lastSummary.coupon.code : ''}" />
      <button id="apply-coupon" class="btn-ghost !px-4 text-sm">اعمال</button>
    </div>
    <div id="coupon-msg" class="text-xs mb-3"></div>
    <a href="/pages/checkout.html" class="btn-primary w-full !py-3 ${cart.length ? '' : 'pointer-events-none opacity-50'}"><i class="fa-solid fa-credit-card"></i> ادامه و پرداخت</a>
    <button id="clear-cart" class="btn-ghost w-full mt-2 text-sm">خالی کردن سبد</button>
  `;

  document.getElementById('apply-coupon').addEventListener('click', () => refreshSummary(true));
  document.getElementById('clear-cart').addEventListener('click', () => {
    if (confirm('سبد خرید خالی شود؟')) store.clearCart();
  });

  await refreshSummary(false);
}

async function refreshSummary(useCouponInput) {
  const cart = store.getCart();
  if (!cart.length) return;
  const couponInput = document.getElementById('coupon-input');
  const couponCode = useCouponInput && couponInput ? couponInput.value.trim() : lastSummary?.coupon?.code || '';

  try {
    const res = await api.post('/api/cart/preview', { items: cart, couponCode: couponCode || undefined });
    lastSummary = res.data;
    const s = res.data;
    const lines = document.getElementById('summary-lines');
    lines.innerHTML = `
      <div class="flex justify-between"><span>جمع کل</span><span>${fmtPrice(s.subtotal)}</span></div>
      ${s.discount ? `<div class="flex justify-between text-primary"><span>تخفیف</span><span>- ${fmtPrice(s.discount)}</span></div>` : ''}
      ${s.walletUsed ? `<div class="flex justify-between"><span>کیف پول</span><span>- ${fmtPrice(s.walletUsed)}</span></div>` : ''}
      <hr class="border-black/10 dark:border-white/10 my-1" />
      <div class="flex justify-between text-base font-bold text-ink dark:text-snow"><span>مبلغ نهایی</span><span>${fmtPrice(s.total)}</span></div>
    `;
    const msg = document.getElementById('coupon-msg');
    if (couponCode) {
      if (s.coupon?.valid) msg.innerHTML = `<span class="text-primary"><i class="fa-solid fa-circle-check"></i> کد تخفیف اعمال شد.</span>`;
      else msg.innerHTML = `<span class="text-red-500"><i class="fa-solid fa-circle-xmark"></i> ${escapeHtml(s.coupon?.reason || 'کد نامعتبر است.')}</span>`;
    } else msg.textContent = '';
  } catch (e) {
    document.getElementById('summary-lines').innerHTML = `<div class="text-red-500 text-xs">${escapeHtml(e.message)}</div>`;
  }
}

init();
