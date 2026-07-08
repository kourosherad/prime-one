/**
 * Prime One — homepage logic.
 * Loads aggregates, renders sections, wires animations + interactions.
 */
import { api } from '../api.js';
import { store, bindAddToCartIfReady } from '../bootstrap.js';
import { productCard, skeletonCard, emptyState, stars } from '../helpers.js';

async function init() {
  // Init AOS.
  if (window.AOS) window.AOS.init({ duration: 700, once: true, offset: 60 });

  // Hero animation.
  if (window.gsap) {
    window.gsap.from('h1', { y: 24, opacity: 0, duration: 0.8, ease: 'power3.out' });
  }

  // Interactive cursor glow (desktop).
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const glow = document.createElement('div');
    glow.className = 'cursor-glow';
    document.body.appendChild(glow);
    window.addEventListener('mousemove', (e) => {
      glow.style.left = e.clientX + 'px';
      glow.style.top = e.clientY + 'px';
    });
  }

  // Skeletons first.
  const grids = ['categories-grid', 'bestsellers-grid', 'newest-grid', 'discounts-grid'];
  grids.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = Array.from({ length: 4 }, () => skeletonCard()).join('');
  });

  try {
    const res = await api.get('/api/catalog');
    const data = res.data || {};
    renderCategories(data.categories || []);
    renderProducts('bestsellers-grid', data.bestsellers || []);
    renderProducts('newest-grid', data.newest || []);
    renderProducts('discounts-grid', data.discounted || []);
  } catch (e) {
    grids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = emptyState('بارگذاری ناموفق بود. بعداً تلاش کنید.', 'fa-triangle-exclamation');
    });
  }

  renderTestimonials();
  renderFaq();
  animateCounters();
  initTestimonialsSwiper();
}

function renderCategories(cats) {
  const el = document.getElementById('categories-grid');
  if (!el) return;
  if (!cats.length) {
    el.innerHTML = emptyState('دسته‌بندی در دسترس نیست.', 'fa-folder-open');
    return;
  }
  el.innerHTML = cats
    .map(
      (c) => `
    <a href="/pages/category.html?category=${encodeURIComponent(c.slug)}" data-aos="fade-up"
       class="glass p-5 flex flex-col items-center text-center group hover:-translate-y-1 hover:shadow-glow transition-all duration-300">
      <span class="w-14 h-14 rounded-2xl bg-gradient-brand/10 grid place-items-center text-2xl text-primary mb-3 group-hover:scale-110 transition">
        <i class="fa-solid ${c.icon || 'fa-tags'}"></i>
      </span>
      <span class="font-semibold text-sm leading-6">${escapeFa(c.name)}</span>
    </a>`
    )
    .join('');
}

function renderProducts(id, products) {
  const el = document.getElementById(id);
  if (!el) return;
  if (!products.length) {
    el.innerHTML = emptyState('محصولی یافت نشد.', 'fa-box-open');
    return;
  }
  el.innerHTML = products.map(productCard).join('');
}

function renderTestimonials() {
  const el = document.getElementById('testimonials');
  if (!el) return;
  const data = [
    { name: 'علی رضایی', role: 'طراح سایت', text: 'سریع‌ترین تحویلی که تا حالا تجربه کردم. کمتر از ده دقیقه اکانتم فعال شد.', rating: 5 },
    { name: 'مریم حسینی', role: 'دانشجو', text: 'پشتیبانی فوق‌العاده و کیفیت عالی. کاملاً مطمئنم.', rating: 5 },
    { name: 'سینا کریمی', role: 'برنامه‌نویس', text: 'قیمت‌ها منصفانه و گارانتی واقعی. چند بار خرید کردم و همیشه راضی بودم.', rating: 5 },
    { name: 'نگار موسوی', role: 'مدیر محصول', text: 'تجربه خرید روان و حرفه‌ای. دسته‌بندی‌ها کامل و کاربردی است.', rating: 4 },
    { name: 'بهروز نوری', role: 'محتوا‌ساز', text: 'بهترین مرجع برای اشتراک‌های خارجی در ایران.', rating: 5 },
  ];
  el.innerHTML = data
    .map(
      (t) => `
    <div class="swiper-slide">
      <div class="glass p-6 h-full flex flex-col">
        <div class="mb-3">${stars(t.rating)}</div>
        <p class="text-sm leading-8 flex-1">${escapeFa(t.text)}</p>
        <div class="mt-5 flex items-center gap-3">
          <span class="w-10 h-10 rounded-xl bg-gradient-brand grid place-items-center font-bold text-ink">${escapeFa(t.name.slice(0, 1))}</span>
          <div>
            <div class="text-sm font-semibold">${escapeFa(t.name)}</div>
            <div class="text-xs text-mist">${escapeFa(t.role)}</div>
          </div>
        </div>
      </div>
    </div>`
    )
    .join('');
}

function initTestimonialsSwiper() {
  setTimeout(() => {
    if (window.Swiper) {
      // eslint-disable-next-line no-new
      new window.Swiper('.testimonials-swiper', {
        slidesPerView: 1,
        spaceBetween: 16,
        loop: true,
        autoplay: { delay: 4500, disableOnInteraction: false },
        pagination: { el: '.swiper-pagination', clickable: true },
        breakpoints: { 640: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } },
      });
    }
  }, 100);
}

const FAQ = [
  { q: 'چقدر طول می‌کشد اشتراکم فعال شود؟', a: 'بیشتر سرویس‌ها به‌صورت خودکار و کمتر از یک ساعت تحویل داده می‌شوند. در موارد خاص حداکثر تا چند ساعت.' },
  { q: 'آیا گارانتی وجود دارد؟', a: 'بله. تمام اشتراک‌ها تا پایان مدت توافق‌شده گارانتی دارند و در صورت بروز مشکل تعویض یا تمدید انجام می‌شود.' },
  { q: 'روش‌های پرداخت چیست؟', a: 'پرداخت از طریق درگاه امن و معتبر زرین‌پال انجام می‌شود. همچنین امکان استفاده از کیف پول داخلی وجود دارد.' },
  { q: 'اگر اشتراک مورد نظرم نبود؟', a: 'از بخش «درخواست محصول جدید» یا تیکت پشتیبانی، محصول خود را درخواست کنید تا در کوتاه‌ترین زمان افزوده شود.' },
];

function renderFaq() {
  const el = document.getElementById('faq');
  if (!el) return;
  el.innerHTML = FAQ.map(
    (f) => `
    <details class="faq-item glass-sm p-4">
      <summary class="flex items-center justify-between gap-3 font-semibold">
        <span>${escapeFa(f.q)}</span>
        <i class="fa-solid fa-chevron-down faq-icon text-mist transition-transform"></i>
      </summary>
      <p class="text-sm text-mist leading-8 mt-3">${escapeFa(f.a)}</p>
    </details>`
  ).join('');
}

function animateCounters() {
  const els = document.querySelectorAll('[data-counter]');
  const fa = (n) => String(n).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[+d]);
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = Number(el.getAttribute('data-counter')) || 0;
        const duration = 1600;
        const start = performance.now();
        const step = (now) => {
          const p = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = fa(Math.round(target * eased).toLocaleString('en-US'));
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        observer.unobserve(el);
      });
    },
    { threshold: 0.4 }
  );
  els.forEach((el) => observer.observe(el));
}

function escapeFa(s) {
  return String(s == null ? '' : s).replace(/</g, '&lt;');
}

init();
