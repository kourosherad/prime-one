/**
 * Prime One — user account dashboard.
 * Tabs: profile, addresses, orders, wallet, notifications, tickets.
 */
import { api } from '../api.js';
import { store } from '../bootstrap.js';
import { fmtPrice, escapeHtml, emptyState, stars } from '../helpers.js';
import { persian } from '../persian.js';
import { url } from '../config.js';

const TABS = [
  { id: 'profile', label: 'پروفایل', icon: 'fa-user' },
  { id: 'orders', label: 'سفارش‌ها', icon: 'fa-receipt' },
  { id: 'wallet', label: 'کیف پول', icon: 'fa-wallet' },
  { id: 'addresses', label: 'آدرس‌ها', icon: 'fa-location-dot' },
  { id: 'notifications', label: 'اعلان‌ها', icon: 'fa-bell' },
  { id: 'tickets', label: 'تیکت‌ها', icon: 'fa-headset' },
];

let activeTab = new URLSearchParams(location.search).get('tab') || 'profile';
let user = null;

async function init() {
  user = await store.refreshUser();
  if (!user) {
    location.href = `${url('pages/login.html')}?redirect=${encodeURIComponent(url('pages/account.html'))}`;
    return;
  }
  renderSidebar();
  await renderTab(activeTab);
  window.addEventListener('popstate', () => switchTab(new URLSearchParams(location.search).get('tab') || 'profile'));
}

function renderSidebar() {
  document.getElementById('sidebar').innerHTML = `
    <div class="flex items-center gap-3 p-2 mb-3">
      <span class="w-11 h-11 rounded-xl bg-gradient-brand grid place-items-center font-bold text-ink text-lg">${escapeHtml((user.first_name || 'U').slice(0, 1))}</span>
      <div class="min-w-0">
        <div class="font-semibold text-sm truncate">${escapeHtml(`${user.first_name} ${user.last_name}`)}</div>
        <div class="text-xs text-mist truncate">${escapeHtml(user.email)}</div>
      </div>
    </div>
    <hr class="border-black/10 dark:border-white/10 my-2" />
    <nav class="space-y-1">
      ${TABS.map(
        (t) => `<button data-tab="${t.id}" class="tab-btn w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition ${activeTab === t.id ? 'bg-primary/10 text-primary-700 dark:text-primary font-semibold' : 'hover:bg-black/5 dark:hover:bg-white/10'}"><i class="fa-solid ${t.icon} w-5"></i> ${t.label}</button>`
      ).join('')}
    </nav>
    ${store.isAdmin() ? `<a href="/pages/admin/" class="btn-ghost w-full mt-4 text-sm"><i class="fa-solid fa-gauge-high"></i> پیشخوان مدیریت</a>` : ''}
  `;
  document.querySelectorAll('.tab-btn').forEach((b) => b.addEventListener('click', () => switchTab(b.dataset.tab)));
}

function switchTab(tab) {
  activeTab = tab;
  history.replaceState(null, '', `?tab=${tab}`);
  renderSidebar();
  renderTab(tab);
}

async function renderTab(tab) {
  const content = document.getElementById('content');
  content.innerHTML = `<div class="glass p-6 text-sm text-mist">در حال بارگذاری...</div>`;
  try {
    switch (tab) {
      case 'profile': return renderProfile(content);
      case 'orders': return renderOrders(content);
      case 'wallet': return renderWallet(content);
      case 'addresses': return renderAddresses(content);
      case 'notifications': return renderNotifications(content);
      case 'tickets': return renderTickets(content);
    }
  } catch (e) {
    content.innerHTML = emptyState(e.message || 'خطا در بارگذاری.', 'fa-triangle-exclamation');
  }
}

async function renderProfile(el) {
  el.innerHTML = `
    <div class="glass p-6">
      <h2 class="font-bold text-lg mb-4">ویرایش پروفایل</h2>
      <form id="profile-form" class="space-y-4 max-w-lg">
        <div class="grid grid-cols-2 gap-3">
          <div><label class="label">نام</label><input name="firstName" class="input" value="${escapeHtml(user.first_name)}" /></div>
          <div><label class="label">نام خانوادگی</label><input name="lastName" class="input" value="${escapeHtml(user.last_name)}" /></div>
        </div>
        <div><label class="label">ایمیل</label><input class="input bg-black/5 dark:bg-white/5" value="${escapeHtml(user.email)}" disabled /></div>
        <div><label class="label">موبایل</label><input name="phone" class="input" value="${escapeHtml(user.phone || '')}" placeholder="09xxxxxxxxx" /></div>
        <button class="btn-primary" type="submit">ذخیره تغییرات</button>
      </form>
      <hr class="border-black/10 dark:border-white/10 my-6" />
      <h3 class="font-bold mb-3">تغییر رمز عبور</h3>
      <form id="password-form" class="space-y-4 max-w-lg">
        <div><label class="label">رمز فعلی</label><input name="currentPassword" type="password" class="input" required /></div>
        <div><label class="label">رمز جدید</label><input name="newPassword" type="password" class="input" required minlength="8" /></div>
        <button class="btn-dark" type="submit">تغییر رمز</button>
      </form>
    </div>`;

  document.getElementById('profile-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    try {
      const res = await api.put('/api/account/profile', data);
      user = res.data.user;
      store.setUser(user);
      renderSidebar();
      store.toast('پروفایل به‌روزرسانی شد ✅', 'success');
    } catch (err) { store.toast(err.message, 'error'); }
  });
  document.getElementById('password-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    try {
      await api.put('/api/account/password', data);
      store.toast('رمز تغییر کرد. دوباره وارد شوید.', 'success');
      setTimeout(() => (location.href = url('pages/login.html')), 1500);
    } catch (err) { store.toast(err.message, 'error'); }
  });
}

const STATUS_LABELS = {
  pending: 'در انتظار', awaiting_payment: 'در انتظار پرداخت', paid: 'پرداخت شده',
  processing: 'در حال انجام', completed: 'تکمیل شده', cancelled: 'لغو شده', refunded: 'بازگشت داده شده', failed: 'ناموفق',
};
const STATUS_COLORS = { paid: 'text-green-500', completed: 'text-green-500', awaiting_payment: 'text-primary', cancelled: 'text-red-500', failed: 'text-red-500' };

async function renderOrders(el) {
  const res = await api.get('/api/account/orders');
  const orders = res.data || [];
  if (!orders.length) { el.innerHTML = emptyState('سفارشی ثبت نشده است.', 'fa-receipt'); return; }
  el.innerHTML = `<div class="space-y-3">${orders.map((o) => `
    <details class="glass p-4">
      <summary class="flex items-center justify-between cursor-pointer">
        <div class="flex items-center gap-3">
          <span class="chip">${escapeHtml(o.order_number)}</span>
          <span class="text-xs text-mist">${new Date(o.created_at).toLocaleDateString('fa-IR')}</span>
        </div>
        <div class="flex items-center gap-3">
          <span class="font-bold">${fmtPrice(o.total)}</span>
          <span class="text-xs font-medium ${STATUS_COLORS[o.status] || 'text-mist'}">${STATUS_LABELS[o.status] || o.status}</span>
        </div>
      </summary>
      <div class="mt-3 text-xs text-mist">${escapeHtml(o.note || '')}</div>
    </details>`).join('')}</div>`;
}

async function renderWallet(el) {
  const [wallet, txRes] = await Promise.all([
    api.get('/api/account/wallet'),
    api.get('/api/account/wallet/transactions'),
  ]);
  const balance = Number(wallet.data?.balance || 0);
  const txs = txRes.data || [];
  el.innerHTML = `
    <div class="glass p-6 mb-4">
      <div class="text-sm text-mist">موجودی کیف پول</div>
      <div class="text-3xl font-extrabold text-primary mt-1">${fmtPrice(balance)}</div>
    </div>
    <div class="glass p-6">
      <h3 class="font-bold mb-4">تراکنش‌ها</h3>
      ${txs.length ? `<div class="space-y-2">${txs.map((t) => `
        <div class="flex items-center justify-between py-2 border-b border-black/5 dark:border-white/5 last:border-0 text-sm">
          <div><div class="font-medium">${escapeHtml(t.reason || (t.direction === 'credit' ? 'شارژ' : 'برداشت'))}</div><div class="text-xs text-mist">${new Date(t.created_at).toLocaleString('fa-IR')}</div></div>
          <div class="font-bold ${t.direction === 'credit' ? 'text-green-500' : 'text-red-500'}">${t.direction === 'credit' ? '+' : '-'} ${fmtPrice(t.amount)}</div>
        </div>`).join('')}</div>` : emptyState('تراکنشی وجود ندارد.', 'fa-receipt')}
    </div>`;
}

async function renderAddresses(el) {
  const res = await api.get('/api/account/addresses');
  const addrs = res.data || [];
  el.innerHTML = `
    <div class="flex items-center justify-between mb-4">
      <h2 class="font-bold text-lg">آدرس‌ها</h2>
      <button id="add-addr" class="btn-primary text-sm">افزودن آدرس</button>
    </div>
    <div id="addr-list" class="space-y-3">${addrs.length ? addrs.map((a) => `
      <div class="glass p-4">
        <div class="flex items-center justify-between">
          <span class="font-semibold text-sm">${escapeHtml(a.label)} ${a.is_default ? '<span class="chip">پیش‌فرض</span>' : ''}</span>
          <div class="flex gap-2">
            <button data-del-addr="${a.id}" class="text-red-500 text-sm"><i class="fa-solid fa-trash"></i></button>
          </div>
        </div>
        <div class="text-sm text-mist mt-2 leading-7">${escapeHtml(a.recipient)} - ${escapeHtml(a.address || '')} ${a.city ? '، ' + escapeHtml(a.city) : ''}</div>
      </div>`).join('') : emptyState('آدرسی ثبت نشده است.', 'fa-location-dot')}</div>`;
  // Minimal add handler.
  document.getElementById('add-addr').addEventListener('click', async () => {
    const label = prompt('عنوان آدرس (مثلاً خانه):');
    if (!label) return;
    const recipient = prompt('نام تحویل‌گیرنده:');
    const address = prompt('نشانی کامل:');
    if (!recipient || !address) return;
    try {
      await api.post('/api/account/addresses', { label, recipient, address });
      store.toast('آدرس اضافه شد ✅', 'success');
      renderTab('addresses');
    } catch (e) { store.toast(e.message, 'error'); }
  });
  document.querySelectorAll('[data-del-addr]').forEach((b) => b.addEventListener('click', async () => {
    await api.del(`/api/account/addresses/${b.dataset.delAddr}`);
    renderTab('addresses');
  }));
}

async function renderNotifications(el) {
  const res = await api.get('/api/account/notifications');
  const notes = res.data || [];
  el.innerHTML = `
    <div class="flex items-center justify-between mb-4">
      <h2 class="font-bold text-lg">اعلان‌ها</h2>
      ${res.meta?.unread ? `<button id="read-all" class="text-sm text-primary">علامت‌گذاری همه به عنوان خوانده شده</button>` : ''}
    </div>
    <div class="space-y-2">${notes.length ? notes.map((n) => `
      <div class="glass-sm p-4 ${n.is_read ? 'opacity-60' : ''}">
        <div class="flex items-start gap-3">
          <span class="w-2 h-2 rounded-full ${n.is_read ? 'bg-mist' : 'bg-primary'} mt-2"></span>
          <div class="flex-1"><div class="font-semibold text-sm">${escapeHtml(n.title)}</div><div class="text-xs text-mist mt-1 leading-6">${escapeHtml(n.body || '')}</div></div>
        </div>
      </div>`).join('') : emptyState('اعلانی وجود ندارد.', 'fa-bell')}</div>`;
  document.getElementById('read-all')?.addEventListener('click', async () => {
    await api.post('/api/account/notifications/read-all');
    renderTab('notifications');
  });
}

async function renderTickets(el) {
  const res = await api.get('/api/account/tickets');
  const tickets = res.data || [];
  el.innerHTML = `
    <div class="flex items-center justify-between mb-4">
      <h2 class="font-bold text-lg">تیکت‌های پشتیبانی</h2>
      <button id="new-ticket" class="btn-primary text-sm">تیکت جدید</button>
    </div>
    <div class="space-y-2">${tickets.length ? tickets.map((t) => `
      <div class="glass-sm p-4 flex items-center justify-between">
        <div><div class="font-semibold text-sm">${escapeHtml(t.subject)}</div><div class="text-xs text-mist">${escapeHtml(t.ticket_number)} - ${new Date(t.created_at).toLocaleDateString('fa-IR')}</div></div>
        <span class="chip">${t.status === 'open' ? 'باز' : t.status === 'answered' ? 'پاسخ داده شده' : 'بسته'}</span>
      </div>`).join('') : emptyState('تیکتی وجود ندارد.', 'fa-headset')}</div>`;
  document.getElementById('new-ticket').addEventListener('click', async () => {
    const subject = prompt('موضوع تیکت:');
    if (!subject) return;
    const message = prompt('متن پیام:');
    if (!message) return;
    try {
      await api.post('/api/account/tickets', { subject, message });
      store.toast('تیکت ارسال شد ✅', 'success');
      renderTab('tickets');
    } catch (e) { store.toast(e.message, 'error'); }
  });
}

init();
