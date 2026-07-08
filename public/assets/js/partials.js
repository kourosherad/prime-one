/**
 * Prime One — shared navbar + footer markup and injection.
 * Pages call mountPartials() to render the header/footer and wire interactions.
 */
import { subscribe, getState, toggleTheme, cartCount, refreshUser, isAdmin } from './store.js';

export function navbarHTML() {
  return `
  <header id="site-header" class="fixed top-0 inset-x-0 z-50 transition-all duration-300">
    <div class="glass border-0 border-b border-white/30 dark:border-white/5 rounded-none">
      <div class="max-w-7xl mx-auto px-4 sm:px-6">
        <div class="flex items-center justify-between h-16 gap-4">
          <!-- Brand -->
          <a href="/" class="flex items-center gap-2 shrink-0">
            <span class="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-brand text-ink font-extrabold shadow-glow">P1</span>
            <span class="font-display font-extrabold text-lg tracking-tight hidden sm:block">Prime One</span>
          </a>

          <!-- Search (desktop) -->
          <form id="nav-search" class="hidden md:flex flex-1 max-w-xl" action="/pages/category.html">
            <div class="relative w-full">
              <i class="fa-solid fa-magnifying-glass absolute top-1/2 -translate-y-1/2 right-3 text-mist text-sm"></i>
              <input name="q" type="search" placeholder="جستجوی محصول، دسته یا سرویس..."
                     class="input !pr-9 !py-2" />
            </div>
          </form>

          <!-- Actions -->
          <nav class="flex items-center gap-1 sm:gap-2">
            <button id="theme-toggle" type="button" aria-label="تغییر تم"
                    class="w-10 h-10 rounded-xl grid place-items-center hover:bg-black/5 dark:hover:bg-white/10 transition">
              <i class="fa-solid fa-moon dark:hidden"></i><i class="fa-solid fa-sun hidden dark:block"></i>
            </button>

            <a href="/pages/cart.html" class="relative w-10 h-10 rounded-xl grid place-items-center hover:bg-black/5 dark:hover:bg-white/10 transition" aria-label="سبد خرید">
              <i class="fa-solid fa-bag-shopping"></i>
              <span id="cart-count" class="absolute -top-1 -left-1 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-ink text-[10px] font-bold grid place-items-center hidden">0</span>
            </a>

            <div id="user-menu" class="relative"></div>

            <button id="mobile-menu-toggle" type="button" aria-label="منو"
                    class="lg:hidden w-10 h-10 rounded-xl grid place-items-center hover:bg-black/5 dark:hover:bg-white/10 transition">
              <i class="fa-solid fa-bars"></i>
            </button>
          </nav>
        </div>

        <!-- Category nav (desktop) -->
        <nav id="cat-nav" class="hidden lg:flex items-center gap-1 pb-2 overflow-x-auto no-scrollbar text-sm"></nav>
      </div>

      <!-- Mobile menu -->
      <div id="mobile-menu" class="lg:hidden hidden border-t border-white/20 dark:border-white/5">
        <div class="px-4 py-3 space-y-1" id="mobile-cat-nav"></div>
        <form class="px-4 pb-3 md:hidden" action="/pages/category.html">
          <div class="relative">
            <i class="fa-solid fa-magnifying-glass absolute top-1/2 -translate-y-1/2 right-3 text-mist text-sm"></i>
            <input name="q" type="search" placeholder="جستجو..." class="input !pr-9" />
          </div>
        </form>
      </div>
    </div>
  </header>`;
}

export function footerHTML() {
  const year = new Date().getFullYear();
  return `
  <footer class="mt-24 border-t border-black/10 dark:border-white/10 bg-surface-light-2 dark:bg-surface-dark-2">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-14 grid grid-cols-1 md:grid-cols-4 gap-10">
      <div>
        <div class="flex items-center gap-2 mb-3">
          <span class="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-brand text-ink font-extrabold">P1</span>
          <span class="font-display font-extrabold text-lg">Prime One</span>
        </div>
        <p class="text-sm text-mist leading-7">مرجع خرید اشتراک و سرویس‌های بین‌المللی؛ تحویل فوری، پشتیبانی واقعی و گارانتی تا پایان مدت.</p>
        <div class="flex gap-2 mt-4">
          <a href="#" aria-label="اینستاگرام" class="w-9 h-9 rounded-lg grid place-items-center glass-sm hover:shadow-glow transition"><i class="fa-brands fa-instagram"></i></a>
          <a href="#" aria-label="تلگرام" class="w-9 h-9 rounded-lg grid place-items-center glass-sm hover:shadow-glow transition"><i class="fa-brands fa-telegram"></i></a>
          <a href="#" aria-label="واتساپ" class="w-9 h-9 rounded-lg grid place-items-center glass-sm hover:shadow-glow transition"><i class="fa-brands fa-whatsapp"></i></a>
        </div>
      </div>
      <div>
        <h4 class="font-bold mb-3">دسترسی سریع</h4>
        <ul class="space-y-2 text-sm text-mist">
          <li><a href="/" class="hover:text-primary">خانه</a></li>
          <li><a href="/pages/category.html" class="hover:text-primary">همه محصولات</a></li>
          <li><a href="/pages/cart.html" class="hover:text-primary">سبد خرید</a></li>
          <li><a href="/pages/account.html" class="hover:text-primary">حساب کاربری</a></li>
        </ul>
      </div>
      <div>
        <h4 class="font-bold mb-3">پشتیبانی</h4>
        <ul class="space-y-2 text-sm text-mist">
          <li><a href="/pages/contact.html" class="hover:text-primary">تماس با ما</a></li>
          <li><a href="/pages/faq.html" class="hover:text-primary">سوالات متداول</a></li>
          <li><a href="/pages/terms.html" class="hover:text-primary">قوانین و مقررات</a></li>
          <li><a href="/pages/privacy.html" class="hover:text-primary">حریم خصوصی</a></li>
        </ul>
      </div>
      <div>
        <h4 class="font-bold mb-3">خبرنامه</h4>
        <p class="text-sm text-mist mb-3">از تخفیف‌ها و سرویس‌های جدید باخبر شوید.</p>
        <form id="newsletter-form" class="flex gap-2">
          <input type="email" name="email" placeholder="ایمیل شما" class="input !py-2" required />
          <button class="btn-primary !px-4" type="submit"><i class="fa-solid fa-paper-plane"></i></button>
        </form>
        <div class="flex gap-2 mt-4 text-[11px] text-mist">
          <span class="chip"><i class="fa-solid fa-shield-halved text-primary"></i> پرداخت امن</span>
          <span class="chip"><i class="fa-solid fa-bolt text-primary"></i> تحویل فوری</span>
        </div>
      </div>
    </div>
    <div class="border-t border-black/10 dark:border-white/10 py-5 text-center text-xs text-mist">
      © ${persianYear(year)} Prime One — تمامی حقوق محفوظ است.
    </div>
  </footer>`;
}
function persianYear(y) { return String(y).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[+d]); }

function userMenuHTML(user, admin) {
  if (!user) {
    return `
      <a href="/pages/login.html" class="btn-ghost !py-2 !px-3 text-xs hidden sm:inline-flex">ورود</a>
      <a href="/pages/register.html" class="btn-primary !py-2 !px-3 text-xs hidden sm:inline-flex">ثبت‌نام</a>
      <a href="/pages/login.html" class="sm:hidden w-10 h-10 rounded-xl grid place-items-center hover:bg-black/5 dark:hover:bg-white/10"><i class="fa-solid fa-user"></i></a>`;
  }
  const initial = (user.first_name || 'U').slice(0, 1);
  return `
    <div class="relative">
      <button id="user-dropdown-btn" class="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition">
        <span class="w-8 h-8 rounded-lg bg-gradient-brand grid place-items-center font-bold text-ink">${escapeFa(initial)}</span>
        <span class="hidden sm:block text-sm font-medium max-w-[100px] truncate">${escapeFa(user.first_name)}</span>
        <i class="fa-solid fa-chevron-down text-[10px] text-mist"></i>
      </button>
      <div id="user-dropdown" class="hidden absolute left-0 mt-2 w-52 glass rounded-2xl p-2 shadow-glass z-50">
        <a href="/pages/account.html" class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-sm"><i class="fa-solid fa-user text-mist w-4"></i> حساب کاربری</a>
        <a href="/pages/account.html?tab=orders" class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-sm"><i class="fa-solid fa-receipt text-mist w-4"></i> سفارش‌های من</a>
        <a href="/pages/account.html?tab=wallet" class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-sm"><i class="fa-solid fa-wallet text-mist w-4"></i> کیف پول</a>
        ${admin ? '<a href="/pages/admin/" class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-sm"><i class="fa-solid fa-gauge-high text-mist w-4"></i> پیشخوان مدیریت</a>' : ''}
        <hr class="my-1 border-black/10 dark:border-white/10" />
        <button id="logout-btn" class="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-sm text-red-500"><i class="fa-solid fa-arrow-right-from-bracket w-4"></i> خروج</button>
      </div>
    </div>`;
}

function escapeFa(s) { return String(s == null ? '' : s).replace(/</g, '&lt;'); }

export async function mountPartials() {
  // Inject header/footer if placeholders exist.
  const headerHost = document.getElementById('header');
  const footerHost = document.getElementById('footer');
  if (headerHost) headerHost.innerHTML = navbarHTML();
  if (footerHost) footerHost.innerHTML = footerHTML();

  // Theme init.
  const saved = localStorage.getItem('po_theme') || 'light';
  document.documentElement.classList.toggle('dark', saved === 'dark');
  document.documentElement.setAttribute('dir', 'rtl');

  // Fetch categories for nav.
  try {
    const res = await fetch('/api/catalog/categories').then((r) => r.json());
    const cats = (res.data || []).filter((c) => !c.parent_id);
    const nav = document.getElementById('cat-nav');
    const mobile = document.getElementById('mobile-cat-nav');
    const links = cats
      .map(
        (c) =>
          `<a href="/pages/category.html?category=${encodeURIComponent(c.slug)}" class="px-3 py-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 whitespace-nowrap transition">${escapeFa(c.name)}</a>`
      )
      .join('');
    if (nav) nav.innerHTML = links;
    if (mobile)
      mobile.innerHTML = cats
        .map((c) => `<a href="/pages/category.html?category=${encodeURIComponent(c.slug)}" class="block px-3 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10">${escapeFa(c.name)}</a>`)
        .join('');
  } catch {}

  // Wire interactions.
  const themeToggle = document.getElementById('theme-toggle');
  themeToggle?.addEventListener('click', () => toggleTheme());

  const mobileToggle = document.getElementById('mobile-menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  mobileToggle?.addEventListener('click', () => mobileMenu?.classList.toggle('hidden'));

  const ddBtn = document.getElementById('user-dropdown-btn');
  const dd = document.getElementById('user-dropdown');
  ddBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    dd?.classList.toggle('hidden');
  });
  document.addEventListener('click', () => dd?.classList.add('hidden'));

  document.getElementById('logout-btn')?.addEventListener('click', async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    location.href = '/';
  });

  document.getElementById('newsletter-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    import('./store.js').then(({ toast }) => toast('عضویت در خبرنامه انجام شد ✅', 'success'));
  });

  // Render user menu + cart count from state.
  const render = (s) => {
    const host = document.getElementById('user-menu');
    if (host) host.innerHTML = userMenuHTML(s.user, isAdmin());
    const cc = document.getElementById('cart-count');
    if (cc) {
      const n = cartCount();
      cc.textContent = String(n).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[+d]);
      cc.classList.toggle('hidden', n === 0);
    }
    // re-bind dropdown after re-render
    const b = document.getElementById('user-dropdown-btn');
    const d = document.getElementById('user-dropdown');
    b?.addEventListener('click', (e) => {
      e.stopPropagation();
      d?.classList.toggle('hidden');
    });
    document.getElementById('logout-btn')?.addEventListener('click', async () => {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
      location.href = '/';
    });
  };
  subscribe(render);
  render(getState());

  await refreshUser();

  // Header scroll effect.
  const header = document.getElementById('site-header');
  window.addEventListener('scroll', () => {
    if (!header) return;
    if (window.scrollY > 8) header.classList.add('shadow-glass-sm');
    else header.classList.remove('shadow-glass-sm');
  });
}
