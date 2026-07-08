/**
 * Prime One — shared bootstrap for every page.
 * Mounts header/footer, applies theme, refreshes the logged-in user, and wires
 * the global "add to cart" delegation. Pages import { store } and call init().
 */
import * as storeModule from './store.js';
import { mountPartials } from './partials.js';
import { bindAddToCart } from './helpers.js';

let booted = false;
const bootQueue = [];

export const store = storeModule;

export async function boot() {
  if (booted) return;
  // Avoid double-mount in HMR-like setups.
  booted = true;
  await mountPartials();
  bindAddToCart(storeModule);
}

// Run mount on DOM ready for all pages that import this module.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}

export const bindAddToCartIfReady = () => bindAddToCart(storeModule);
