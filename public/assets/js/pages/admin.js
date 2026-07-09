/**
 * Prime One — admin dashboard (SPA-style single page).
 * Sections: overview (charts), products, orders, customers, coupons.
 * Other sections from the brief are linked placeholders for later phases.
 */
import { api, ApiError } from '../api.js';
import { fmtPrice, fmtNum, escapeHtml, emptyState } from '../helpers.js';
import { persian } from '../persian.js';

const NAV = [
  { id: 'overview', label: 'پیشخوان', icon: 'fa-gauge-high' },
  { id: 'products', label: 'محصولات', icon: 'fa-box' },
  { id: 'orders', label: 'سفارش‌ها', icon: 'fa-receipt' },
  { id: 'customers', label: 'مشتریان', icon: 'fa-users' },
  { id: 'coupons', label: 'کد تخفیف', icon: 'fa-ticket' },
  { id: 'categories', label: 'دسته‌بندی', icon: 'fa-folder' },
  { id: 'transactions', label: 'تراکنش‌ها', icon: 'fa-money-bill-transfer' },
  { id: 'settings', label: 'تنظیمات', icon: 'fa-gear' },
  // Placeholders for later phases:
  { id: 'soon', label: 'بلاگ', icon: 'fa-newspaper', soon: true },
  { id: 'soon', label: 'گزارش‌ها', icon: 'fa-chart-column', soon: true },
  { id: 'soon', label: 'رسانه', icon: 'fa-images', soon: true },
];

let active = 'overview';
let salesChart = null;

async function init() {
  // Theme.
  const saved = localStorage.getItem('po_theme') || 'light';
  document.documentElement.classList.toggle('dark', saved === 'dark');
  document.getElementById('theme-toggle').addEventListener('click', () => {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('po_theme', isDark ? 'dark' : 'light');
    if (active === 'overview') renderOverview();
  });
  document.getElementById('sidebar-toggle').addEventListener('click', () =>
    document.getElementById('admin-sidebar').classList.toggle('open')
  );

  // Auth gate: must be staff.
  const me = await api.get('/api/auth/me').catch(() => null);
  const user = me?.data?.user;
  if (!user || !['super_admin', 'admin', 'manager', 'operator'].includes(user.role)) {
    document.getElementById('admin-content').innerHTML = emptyState('دسترسی مجاز نیست. ابتدا به‌عنوان کاربر مدیریت وارد شوید.', 'fa-lock');
    return;
  }
  document.getElementById('admin-user').textContent = `${user.first_name} ${user.last_name} (${roleLabel(user.role)})`;

  renderNav();
  await switchTo('overview');
}

function roleLabel(r) {
  return { super_admin: 'مدیر ارشد', admin: 'مدیر', manager: 'مدیر کل', operator: 'اپراتور' }[r] || r;
}

function renderNav() {
  document.getElementById('admin-nav').innerHTML = NAV.map(
    (n) => `
    <button data-section="${n.id}" data-soon="${n.soon ? '1' : ''}" class="nav-btn w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition ${n.soon ? 'opacity-50 cursor-not-allowed' : 'hover:bg-black/5 dark:hover:bg-white/10'} ${active === n.id ? 'bg-primary/10 text-primary-700 dark:text-primary font-semibold' : ''}">
      <i class="fa-solid ${n.icon} w-5"></i>
      <span>${n.label}</span>
      ${n.soon ? '<span class="chip !text-[10px] mr-auto">به‌زودی</span>' : ''}
    </button>`
  ).join('');
  document.querySelectorAll('.nav-btn').forEach((b) =>
    b.addEventListener('click', () => {
      if (b.dataset.soon === '1') return;
      switchTo(b.dataset.section);
    })
  );
}

async function switchTo(section) {
  active = section;
  document.getElementById('page-title').textContent = NAV.find((n) => n.id === section)?.label || '';
  renderNav();
  const content = document.getElementById('admin-content');
  content.innerHTML = `<div class="glass p-6 text-sm text-mist">در حال بارگذاری...</div>`;
  try {
    switch (section) {
      case 'overview': return await renderOverview();
      case 'products': return await renderProducts();
      case 'orders': return await renderOrders();
      case 'customers': return await renderCustomers();
      case 'coupons': return await renderCoupons();
      case 'categories': return await renderCategories();
      case 'transactions': return await renderTransactions();
      case 'settings': return await renderSettings();
      default: content.innerHTML = emptyState('این بخش در فاز بعدی اضافه می‌شود.', 'fa-screwdriver-wrench');
    }
  } catch (e) {
    content.innerHTML = emptyState(e.message || 'خطا در بارگذاری.', 'fa-triangle-exclamation');
  }
}

// ── Overview ──
async function renderOverview() {
  const [ov, chart, recent] = await Promise.all([
    api.get('/api/admin/overview'),
    api.get('/api/admin/sales-chart', { days: 14 }),
    api.get('/api/admin/recent-orders'),
  ]);
  const d = ov.data || {};
  const cards = [
    { label: 'فروش امروز', value: fmtPrice(d.todaySales), icon: 'fa-money-bill-trend-up', color: 'text-green-500' },
    { label: 'درآمد ماه', value: fmtPrice(d.monthRevenue), icon: 'fa-chart-line', color: 'text-primary' },
    { label: 'سفارش‌ها', value: fmtNum(d.orders), icon: 'fa-receipt', color: 'text-blue-500' },
    { label: 'مشتریان', value: fmtNum(d.customers), icon: 'fa-users', color: 'text-purple-500' },
    { label: 'محصولات', value: fmtNum(d.products), icon: 'fa-box', color: 'text-orange-500' },
    { label: 'تیکت‌های باز', value: fmtNum(d.pendingTickets), icon: 'fa-headset', color: 'text-red-500' },
  ];

  const content = document.getElementById('admin-content');
  content.innerHTML = `
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
      ${cards.map((c) => `
        <div class="glass p-4">
          <div class="flex items-center justify-between">
            <i class="fa-solid ${c.icon} ${c.color} text-xl"></i>
          </div>
          <div class="text-xl font-extrabold mt-3">${c.value}</div>
          <div class="text-xs text-mist mt-1">${c.label}</div>
        </div>`).join('')}
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4">
      <div class="glass p-6">
        <h3 class="font-bold mb-4">فروش ۱۴ روز اخیر</h3>
        <canvas id="sales-canvas" height="120"></canvas>
      </div>
      <div class="glass p-6">
        <h3 class="font-bold mb-4">سفارش‌های اخیر</h3>
        <div class="space-y-2 text-sm">
          ${(recent.data || []).map((o) => `
            <div class="flex items-center justify-between py-2 border-b border-black/5 dark:border-white/5 last:border-0">
              <div><div class="font-medium">${escapeHtml(o.order_number)}</div><div class="text-xs text-mist">${escapeHtml(o.first_name || '')} ${escapeHtml(o.last_name || '')}</div></div>
              <div class="text-left"><div class="font-bold">${fmtPrice(o.total)}</div><div class="text-xs text-mist">${statusLabel(o.status)}</div></div>
            </div>`).join('') || emptyState('سفارشی ثبت نشده.', 'fa-receipt')}
        </div>
      </div>
    </div>`;

  // Chart.
  const ctx = document.getElementById('sales-canvas');
  if (ctx && window.Chart) {
    const rows = chart.data || [];
    const labels = rows.map((r) => new Date(r.d).toLocaleDateString('fa-IR'));
    const data = rows.map((r) => Number(r.total));
    salesChart?.destroy();
    salesChart = new window.Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'فروش (تومان)',
          data,
          borderColor: '#FFB300',
          backgroundColor: 'rgba(255,179,0,0.12)',
          fill: true,
          tension: 0.35,
          pointRadius: 3,
          pointBackgroundColor: '#FF6F00',
        }],
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          y: { ticks: { callback: (v) => persian.formatNumber(v) } },
          x: { ticks: { maxRotation: 0, autoSkip: true } },
        },
      },
    });
  }
}

// ── Products ──
async function renderProducts(page = 1) {
  const res = await api.get('/api/admin/products', { page });
  const rows = res.data || [];
  const content = document.getElementById('admin-content');
  content.innerHTML = `
    <div class="flex items-center justify-between mb-4">
      <input id="product-search" class="input max-w-xs" placeholder="جستجوی محصول..." />
      <a href="/pages/admin/product-edit.html" class="btn-primary text-sm"><i class="fa-solid fa-plus"></i> محصول جدید</a>
    </div>
    <div class="glass overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-black/5 dark:bg-white/5 text-mist text-xs">
            <tr><th class="text-right p-3">محصول</th><th class="text-right p-3">کد</th><th class="text-right p-3">قیمت</th><th class="text-right p-3">موجودی</th><th class="text-right p-3">وضعیت</th><th class="p-3"></th></tr>
          </thead>
          <tbody>
            ${rows.map((p) => `
              <tr class="border-t border-black/5 dark:border-white/5">
                <td class="p-3"><div class="flex items-center gap-3"><img src="${p.main_image || ''}" class="w-10 h-10 rounded-lg object-cover bg-black/5"/><span class="font-medium line-clamp-1 max-w-[220px]">${escapeHtml(p.title)}</span></div></td>
                <td class="p-3 text-mist">${escapeHtml(p.product_code)}</td>
                <td class="p-3">${fmtPrice(p.effective_price ?? p.price)}</td>
                <td class="p-3">${persian.toFa(p.is_unlimited ? '∞' : p.stock)}</td>
                <td class="p-3"><span class="chip">${statusLabel(p.status)}</span></td>
                <td class="p-3 text-left whitespace-nowrap"><a href="/pages/admin/product-edit.html?id=${p.id}" class="text-primary hover:underline">ویرایش</a> <button data-del="${p.id}" class="text-red-500 hover:underline mr-2">حذف</button></td>
              </tr>`).join('') || `<tr><td colspan="6">${emptyState('محصولی وجود ندارد.', 'fa-box')}</td></tr>`}
          </tbody>
        </table>
      </div>
    </div>`;
  document.getElementById('product-search').addEventListener('input', (e) => searchProducts(e.target.value));
  document.querySelectorAll('[data-del]').forEach((b) => b.addEventListener('click', async () => {
    if (!confirm('محصول حذف شود؟')) return;
    await api.del(`/api/admin/products/${b.dataset.del}`);
    renderProducts();
  }));
}
let searchTimer;
async function searchProducts(q) {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(async () => {
    const res = await api.get('/api/admin/products', { q });
    const rows = res.data || [];
    const tbody = document.querySelector('#admin-content tbody');
    tbody.innerHTML = rows.map((p) => `<tr class="border-t border-black/5 dark:border-white/5"><td class="p-3"><div class="flex items-center gap-3"><img src="${p.main_image || ''}" class="w-10 h-10 rounded-lg object-cover"/><span class="font-medium">${escapeHtml(p.title)}</span></div></td><td class="p-3 text-mist">${escapeHtml(p.product_code)}</td><td class="p-3">${fmtPrice(p.price)}</td><td class="p-3">${persian.toFa(p.stock)}</td><td class="p-3"><span class="chip">${statusLabel(p.status)}</span></td><td class="p-3"><a href="/pages/admin/product-edit.html?id=${p.id}" class="text-primary">ویرایش</a> <button data-del="${p.id}" class="text-red-500 mr-2">حذف</button></td></tr>`).join('');
  }, 300);
}

// ── Orders ──
async function renderOrders() {
  const res = await api.get('/api/admin/orders');
  const rows = res.data || [];
  document.getElementById('admin-content').innerHTML = `
    <div class="glass overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-black/5 dark:bg-white/5 text-mist text-xs"><tr><th class="text-right p-3">شماره</th><th class="text-right p-3">مشتری</th><th class="text-right p-3">مبلغ</th><th class="text-right p-3">وضعیت</th><th class="text-right p-3">تاریخ</th><th class="p-3"></th></tr></thead>
          <tbody>${rows.map((o) => `<tr class="border-t border-black/5 dark:border-white/5"><td class="p-3 font-medium">${escapeHtml(o.order_number)}</td><td class="p-3">${escapeHtml(o.first_name)} ${escapeHtml(o.last_name)}</td><td class="p-3 font-bold">${fmtPrice(o.total)}</td><td class="p-3"><span class="chip">${statusLabel(o.status)}</span></td><td class="p-3 text-mist text-xs">${new Date(o.created_at).toLocaleDateString('fa-IR')}</td><td class="p-3"><select data-status="${o.id}" class="input !py-1 !text-xs"><option value="">تغییر وضعیت...</option><option value="processing">در حال انجام</option><option value="completed">تکمیل</option><option value="cancelled">لغو</option></select></td></tr>`).join('')}</tbody>
        </table>
      </div>
    </div>`;
  document.querySelectorAll('[data-status]').forEach((s) => s.addEventListener('change', async () => {
    if (!s.value) return;
    await api.patch(`/api/admin/orders/${s.dataset.status}/status`, { status: s.value });
    toast('وضعیت به‌روزرسانی شد', 'success');
    renderOrders();
  }));
}

// ── Customers ──
async function renderCustomers() {
  const res = await api.get('/api/admin/users', { role: 'customer' });
  const rows = res.data || [];
  document.getElementById('admin-content').innerHTML = `
    <div class="glass overflow-hidden">
      <div class="overflow-x-auto"><table class="w-full text-sm">
        <thead class="bg-black/5 dark:bg-white/5 text-mist text-xs"><tr><th class="text-right p-3">نام</th><th class="text-right p-3">ایمیل</th><th class="text-right p-3">موبایل</th><th class="text-right p-3">وضعیت</th><th class="text-right p-3">عضویت</th></tr></thead>
        <tbody>${rows.map((u) => `<tr class="border-t border-black/5 dark:border-white/5"><td class="p-3 font-medium">${escapeHtml(u.first_name)} ${escapeHtml(u.last_name)}</td><td class="p-3 text-mist">${escapeHtml(u.email)}</td><td class="p-3 text-mist">${escapeHtml(u.phone || '—')}</td><td class="p-3"><span class="chip">${u.status === 'active' ? 'فعال' : 'غیرفعال'}</span></td><td class="p-3 text-mist text-xs">${new Date(u.created_at).toLocaleDateString('fa-IR')}</td></tr>`).join('')}</tbody>
      </table></div>
    </div>`;
}

// ── Coupons ──
async function renderCoupons() {
  const res = await api.get('/api/admin/coupons');
  const rows = res.data || [];
  document.getElementById('admin-content').innerHTML = `
    <div class="flex justify-end mb-4"><button id="new-coupon" class="btn-primary text-sm"><i class="fa-solid fa-plus"></i> کد جدید</button></div>
    <div class="glass overflow-hidden"><div class="overflow-x-auto"><table class="w-full text-sm">
      <thead class="bg-black/5 dark:bg-white/5 text-mist text-xs"><tr><th class="text-right p-3">کد</th><th class="text-right p-3">نوع</th><th class="text-right p-3">مقدار</th><th class="text-right p-3">استفاده</th><th class="text-right p-3">وضعیت</th><th class="p-3"></th></tr></thead>
      <tbody>${rows.map((c) => `<tr class="border-t border-black/5 dark:border-white/5"><td class="p-3 font-medium">${escapeHtml(c.code)}</td><td class="p-3">${c.type === 'percent' ? 'درصدی' : 'مبلغی'}</td><td class="p-3">${c.type === 'percent' ? persian.toFa(c.value) + '٪' : fmtPrice(c.value)}</td><td class="p-3">${persian.toFa(c.used_count)}</td><td class="p-3"><span class="chip">${c.is_active ? 'فعال' : 'غیرفعال'}</span></td><td class="p-3"><button data-del="${c.id}" class="text-red-500">حذف</button></td></tr>`).join('')}</tbody>
    </table></div></div>`;
  document.querySelectorAll('[data-del]').forEach((b) => b.addEventListener('click', async () => { await api.del(`/api/admin/coupons/${b.dataset.del}`); renderCoupons(); }));
  document.getElementById('new-coupon').addEventListener('click', async () => {
    const code = prompt('کد تخفیف:');
    if (!code) return;
    const type = confirm('تایید = درصدی، انصراف = مبلغی') ? 'percent' : 'fixed';
    const value = Number(prompt('مقدار (عدد):'));
    if (!value) return;
    await api.post('/api/admin/coupons', { code, type, value });
    renderCoupons();
  });
}

// ── Categories ──
async function renderCategories() {
  const res = await api.get('/api/admin/categories');
  const rows = res.data || [];
  document.getElementById('admin-content').innerHTML = `
    <div class="glass overflow-hidden"><div class="overflow-x-auto"><table class="w-full text-sm">
      <thead class="bg-black/5 dark:bg-white/5 text-mist text-xs"><tr><th class="text-right p-3">نام</th><th class="text-right p-3">محصولات</th><th class="text-right p-3">ویژه</th></tr></thead>
      <tbody>${rows.map((c) => `<tr class="border-t border-black/5 dark:border-white/5"><td class="p-3 font-medium">${escapeHtml(c.name)}</td><td class="p-3">${persian.toFa(c.product_count || 0)}</td><td class="p-3">${c.is_featured ? '<i class="fa-solid fa-star text-primary"></i>' : ''}</td></tr>`).join('')}</tbody>
    </table></div></div>`;
}

// ── Transactions ──
async function renderTransactions() {
  const res = await api.get('/api/admin/transactions');
  const rows = res.data || [];
  document.getElementById('admin-content').innerHTML = `
    <div class="glass overflow-hidden"><div class="overflow-x-auto"><table class="w-full text-sm">
      <thead class="bg-black/5 dark:bg-white/5 text-mist text-xs"><tr><th class="text-right p-3">کد پیگیری</th><th class="text-right p-3">درگاه</th><th class="text-right p-3">مبلغ</th><th class="text-right p-3">وضعیت</th><th class="text-right p-3">تاریخ</th></tr></thead>
      <tbody>${rows.map((t) => `<tr class="border-t border-black/5 dark:border-white/5"><td class="p-3 font-medium">${escapeHtml(t.tracking_code)}</td><td class="p-3">${escapeHtml(t.gateway)}</td><td class="p-3 font-bold">${fmtPrice(t.amount)}</td><td class="p-3"><span class="chip">${statusLabel(t.status)}</span></td><td class="p-3 text-mist text-xs">${new Date(t.created_at).toLocaleDateString('fa-IR')}</td></tr>`).join('')}</tbody>
    </table></div></div>`;
}

// ── Settings ──
async function renderSettings() {
  const res = await api.get('/api/admin/settings');
  const s = res.data || {};
  document.getElementById('admin-content').innerHTML = `
    <form id="settings-form" class="glass p-6 max-w-2xl space-y-4">
      <h3 class="font-bold">تنظیمات سایت</h3>
      <div><label class="label">نام سایت</label><input name="site.name" class="input" value="${escapeHtml(s['site.name'] || '')}"/></div>
      <div><label class="label">شعار</label><input name="site.tagline" class="input" value="${escapeHtml(s['site.tagline'] || '')}"/></div>
      <div><label class="label">ایمیل پشتیبانی</label><input name="contact.email" class="input" value="${escapeHtml(s['contact.email'] || '')}"/></div>
      <div><label class="label">عنوان پیش‌فرض سئو</label><input name="seo.title_default" class="input" value="${escapeHtml(s['seo.title_default'] || '')}"/></div>
      <button class="btn-primary">ذخیره</button>
    </form>`;
  document.getElementById('settings-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    await api.put('/api/admin/settings', data);
    toast('تنظیمات ذخیره شد', 'success');
  });
}

function statusLabel(s) {
  const m = { active: 'فعال', draft: 'پیش‌نویس', out_of_stock: 'ناموجود', discontinued: 'متوقف شده', pending: 'در انتظار', awaiting_payment: 'در انتظار پرداخت', paid: 'پرداخت شده', processing: 'در حال انجام', completed: 'تکمیل شده', cancelled: 'لغو شده', failed: 'ناموفق', refunded: 'برگشت خورده' };
  return m[s] || s;
}

function toast(msg, type = 'info') {
  import('../store.js').then(({ toast }) => toast(msg, type));
}

init();
