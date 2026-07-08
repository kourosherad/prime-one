/**
 * Prime One — checkout page.
 * Requires authentication; if guest, redirect to login.
 */
import { api, ApiError } from '../api.js';
import { store } from '../bootstrap.js';
import { fmtPrice, escapeHtml, emptyState } from '../helpers.js';

async function init() {
  const root = document.getElementById('checkout-root');
  const cart = store.getCart();

  // Auth gate.
  const user = await store.refreshUser();
  if (!user) {
    root.innerHTML = emptyState('برای ادامه باید وارد شوید.', 'fa-user-lock');
    setTimeout(() => (location.href = `/pages/login.html?redirect=${encodeURIComponent('/pages/checkout.html')}`), 1500);
    return;
  }
  if (!cart.length) {
    root.innerHTML = emptyState('سبد خرید شما خالی است.', 'fa-cart-shopping');
    return;
  }

  // Wallet balance.
  let walletBalance = 0;
  try {
    const w = await api.get('/api/account/wallet');
    walletBalance = Number(w.data?.balance || 0);
  } catch {}

  // Pricing preview.
  let summary = null;
  try {
    const res = await api.post('/api/cart/preview', { items: cart });
    summary = res.data;
  } catch (e) {
    root.innerHTML = emptyState(e.message || 'خطا در محاسبه سبد.', 'fa-triangle-exclamation');
    return;
  }

  root.innerHTML = `
    <section class="space-y-5">
      <div class="glass p-6">
        <h3 class="font-bold mb-1">اطلاعات سفارش</h3>
        <p class="text-xs text-mist mb-4">سفارش به نام ${escapeHtml(`${user.first_name} ${user.last_name}`)} (${escapeHtml(user.email)}) ثبت می‌شود.</p>
        <label class="label">یادداشت سفارش (اختیاری)</label>
        <textarea id="note" rows="2" class="input" placeholder="هر توضیح لازم..."></textarea>
      </div>

      <div class="glass p-6">
        <h3 class="font-bold mb-3">روش پرداخت</h3>
        <label class="flex items-center gap-3 p-3 rounded-xl border-2 border-primary bg-primary/5 cursor-pointer">
          <input type="radio" name="method" value="zarinpal" checked class="accent-[#FFB300] w-4 h-4" />
          <i class="fa-solid fa-credit-card text-primary"></i>
          <span class="text-sm font-medium">درگاه امن زرین‌پال</span>
        </label>
        ${
          walletBalance > 0
            ? `
        <label class="flex items-center gap-3 p-3 rounded-xl border-2 border-transparent hover:border-black/10 dark:hover:border-white/10 cursor-pointer mt-2">
          <input id="use-wallet" type="checkbox" class="accent-[#FFB300] w-4 h-4" />
          <i class="fa-solid fa-wallet text-primary"></i>
          <span class="text-sm">استفاده از موجودی کیف پول (${fmtPrice(walletBalance)})</span>
        </label>`
            : ''
        }
      </div>
    </section>

    <aside class="glass p-6 h-fit lg:sticky lg:top-24">
      <h3 class="font-bold mb-4">خلاصه سفارش</h3>
      <div id="items-list" class="space-y-3 mb-4 max-h-64 overflow-auto no-scrollbar">
        ${summary.items
          .map(
            (i) => `
          <div class="flex items-center gap-3">
            <img src="${i.image || ''}" class="w-12 h-12 rounded-lg object-cover bg-black/5" alt=""/>
            <div class="flex-1 min-w-0">
              <div class="text-xs line-clamp-1">${escapeHtml(i.title)}</div>
              <div class="text-[11px] text-mist">${fmtPrice(i.unitPrice)} × ${i.quantity}</div>
            </div>
            <div class="text-xs font-bold">${fmtPrice(i.lineTotal)}</div>
          </div>`
          )
          .join('')}
      </div>
      <hr class="border-black/10 dark:border-white/10 my-3" />
      <div class="space-y-2 text-sm text-mist">
        <div class="flex justify-between"><span>جمع کل</span><span>${fmtPrice(summary.subtotal)}</span></div>
        ${summary.discount ? `<div class="flex justify-between text-primary"><span>تخفیف</span><span>- ${fmtPrice(summary.discount)}</span></div>` : ''}
        <div id="wallet-line" class="hidden flex justify-between"><span>کیف پول</span><span id="wallet-amt">- ۰</span></div>
      </div>
      <hr class="border-black/10 dark:border-white/10 my-3" />
      <div class="flex justify-between text-lg font-extrabold mb-4">
        <span>قابل پرداخت</span><span id="payable">${fmtPrice(summary.total)}</span>
      </div>
      <button id="pay-btn" class="btn-primary w-full !py-3"><i class="fa-solid fa-lock"></i> پرداخت و ثبت سفارش</button>
      <p class="text-[11px] text-mist text-center mt-3"><i class="fa-solid fa-shield-halved text-primary"></i> پرداخت از طریق درگاه امن انجام می‌شود.</p>
    </aside>
  `;

  // Wallet toggle recalculates.
  let walletUse = 0;
  const walletCheckbox = document.getElementById('use-wallet');
  walletCheckbox?.addEventListener('change', async () => {
    walletUse = walletCheckbox.checked ? walletBalance : 0;
    const res = await api.post('/api/cart/preview', { items: cart, walletUse });
    const s = res.data;
    document.getElementById('payable').textContent = fmtPrice(s.total);
    const line = document.getElementById('wallet-line');
    line.classList.toggle('hidden', !s.walletUsed);
    document.getElementById('wallet-amt').textContent = `- ${fmtPrice(s.walletUsed)}`;
  });

  // Pay.
  document.getElementById('pay-btn').addEventListener('click', async () => {
    const btn = document.getElementById('pay-btn');
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> در حال انتقال به درگاه...';
    try {
      const res = await api.post('/api/orders', {
        items: cart,
        walletUse,
        note: document.getElementById('note').value.trim() || undefined,
      });
      // Redirect to gateway.
      if (res.data?.gatewayUrl) {
        store.clearCart();
        window.location.href = res.data.gatewayUrl;
      } else {
        throw new Error('پاسخ درگاه نامعتبر است.');
      }
    } catch (e) {
      btn.disabled = false;
      btn.innerHTML = '<i class="fa-solid fa-lock"></i> پرداخت و ثبت سفارش';
      store.toast ? store.toast(e.message || 'خطا در ثبت سفارش.', 'error') : alert(e.message);
    }
  });
}

init();
