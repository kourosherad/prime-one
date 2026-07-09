/**
 * Prime One — shared bootstrap for every page.
 * Mounts header/footer, applies theme, refreshes the logged-in user, and wires
 * the global "add to cart" delegation. Pages import { store } and call init().
 */
import * as storeModule from './store.js';
import { mountPartials } from './partials.js';
import { bindAddToCart } from './helpers.js';
import { BASE_PATH, DEMO_MODE, url } from './config.js';

export const store = storeModule;

let booted = false;

/**
 * Rewrite root-relative URLs in injected DOM (navbar/footer/etc.) to include
 * the deployment base path. This keeps the source files portable (written for
 * domain-root local dev) while working under /prime-one/ on GitHub Pages.
 * Only rewrites href/src pointing to our own paths (not http(s) or # or data:).
 */
const normalizeLinks = (root = document) => {
  if (BASE_PATH === '/') return; // nothing to do at domain root
  root.querySelectorAll('a[href^="/"], img[src^="/"], link[href^="/"], script[src^="/"]').forEach((el) => {
    ['href', 'src'].forEach((attr) => {
      const v = el.getAttribute(attr);
      if (v && v.startsWith('/') && !v.startsWith('//')) {
        el.setAttribute(attr, BASE_PATH.replace(/\/$/, '') + v);
      }
    });
  });
};

// Re-run normalization after each store change (navbar/user menu re-renders).
storeModule.subscribe(() => requestAnimationFrame(() => normalizeLinks()));

export async function boot() {
  if (booted) return;
  booted = true;
  await mountPartials();
  normalizeLinks();
  bindAddToCart(storeModule);

  // Show a small "demo mode" banner so visitors understand API features are off.
  if (DEMO_MODE) {
    const banner = document.createElement('div');
    banner.className =
      'fixed bottom-4 left-1/2 -translate-x-1/2 z-[90] glass-sm px-4 py-2 rounded-full text-xs text-mist shadow-glass-sm border border-primary/30 flex items-center gap-2';
    banner.innerHTML =
      '<i class="fa-solid fa-circle-info text-primary"></i> نسخه نمایشی — بخش‌هایی از سایت نیازمند سرور هستند. <a class="text-primary underline" href="https://github.com/kourosherad/prime-one#quick-start" target="_blank" rel="noopener">راه‌اندازی کامل</a>';
    document.body.appendChild(banner);
  }
}

// Patch location.href assignments used across pages so they honor the base path.
// Expose a global helper pages can use; existing pages import { url } from config.
export { url };

// Run mount on DOM ready for all pages that import this module.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}

export const bindAddToCartIfReady = () => bindAddToCart(storeModule);
