/**
 * Prime One — frontend state store (cart, theme, auth user, toast).
 * Uses a tiny pub/sub so components can subscribe to changes.
 */
import { api } from './api.js';

const KEY_CART = 'po_cart';
const KEY_THEME = 'po_theme';
const KEY_RECENT = 'po_recent';

const listeners = new Set();
const state = {
  user: null,
  cart: loadCart(),
  theme: localStorage.getItem(KEY_THEME) || 'light',
  recent: JSON.parse(localStorage.getItem(KEY_RECENT) || '[]'),
};

function loadCart() {
  try {
    return JSON.parse(localStorage.getItem(KEY_CART) || '[]');
  } catch {
    return [];
  }
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function emit() {
  listeners.forEach((fn) => fn(state));
}

function persist() {
  localStorage.setItem(KEY_CART, JSON.stringify(state.cart));
  localStorage.setItem(KEY_THEME, state.theme);
}

// ── Theme ──
export function applyTheme(theme) {
  state.theme = theme;
  const root = document.documentElement;
  if (theme === 'dark') root.classList.add('dark');
  else root.classList.remove('dark');
  root.setAttribute('data-theme', theme);
  persist();
  emit();
}
export function toggleTheme() {
  applyTheme(state.theme === 'dark' ? 'light' : 'dark');
}

// ── Auth user ──
export function setUser(user) {
  state.user = user;
  emit();
}
export async function refreshUser() {
  try {
    const res = await api.get('/api/auth/me');
    setUser(res.data?.user || null);
    return res.data?.user || null;
  } catch {
    setUser(null);
    return null;
  }
}
export function isAdmin() {
  return ['super_admin', 'admin', 'manager', 'operator'].includes(state.user?.role);
}

// ── Cart ──
export function getCart() {
  return state.cart;
}
export function cartCount() {
  return state.cart.reduce((s, i) => s + i.quantity, 0);
}
export function addToCart(productId, quantity = 1, product) {
  const existing = state.cart.find((i) => i.productId === productId);
  if (existing) existing.quantity += quantity;
  else state.cart.push({ productId, quantity, ...(product ? { product } : {}) });
  persist();
  emit();
  toast(`به سبد خرید اضافه شد (${cartCount()})`, 'success');
}
export function updateQty(productId, quantity) {
  const it = state.cart.find((i) => i.productId === productId);
  if (it) {
    it.quantity = Math.max(1, quantity);
    persist();
    emit();
  }
}
export function removeFromCart(productId) {
  state.cart = state.cart.filter((i) => i.productId !== productId);
  persist();
  emit();
}
export function clearCart() {
  state.cart = [];
  persist();
  emit();
}

// ── Recently viewed ──
export function addRecent(product) {
  if (!product) return;
  state.recent = [product, ...state.recent.filter((p) => p.id !== product.id)].slice(0, 8);
  localStorage.setItem(KEY_RECENT, JSON.stringify(state.recent));
  emit();
}

// ── Toast ──
export function toast(message, type = 'info', timeout = 3500) {
  const host = document.getElementById('toast-host') || (() => {
    const el = document.createElement('div');
    el.id = 'toast-host';
    el.className = 'fixed top-5 right-5 z-[100] flex flex-col gap-2';
    document.body.appendChild(el);
    return el;
  })();
  const colors = {
    success: 'border-primary/40 bg-primary/10 text-ink dark:text-snow',
    error: 'border-red-500/40 bg-red-500/10 text-red-600 dark:text-red-400',
    info: 'border-black/10 bg-white/80 dark:bg-surface-dark-2/80 text-ink dark:text-snow',
  };
  const el = document.createElement('div');
  el.className = `glass-sm border ${colors[type] || colors.info} px-4 py-3 rounded-xl text-sm shadow-glass-sm animate-fade-in max-w-xs`;
  el.textContent = message;
  host.appendChild(el);
  setTimeout(() => {
    el.style.transition = 'opacity .3s, transform .3s';
    el.style.opacity = '0';
    el.style.transform = 'translateY(-6px)';
    setTimeout(() => el.remove(), 300);
  }, timeout);
}

export function getState() {
  return state;
}
