/**
 * Prime One — runtime path config.
 *
 * Works for BOTH deployment targets:
 *  - Local dev:  app served at the domain root → BASE = '/'
 *  - GitHub Pages (project site): served at /prime-one/ → BASE = '/prime-one/'
 *
 * The base is derived from where THIS module lives (assets/js/config.js), so no
 * hardcoded path is needed. Everything else imports { url } and prepends BASE.
 */
const BASE = (() => {
  // In the browser, document.currentScript is null for ES modules, so derive
  // from import.meta.url if available, otherwise fall back to detecting the
  // <script> src or the known pages host.
  try {
    const here = new URL('.', import.meta.url).pathname; // e.g. /prime-one/assets/js/
    // strip trailing assets/js/ to get the site root
    const m = here.replace(/assets\/js\/$/, '');
    return m || '/';
  } catch {
    return '/';
  }
})();

// Normalize: ensure leading + trailing slash.
const normalize = (p) => (p.startsWith('/') ? p : '/' + p);
export const BASE_PATH = BASE.endsWith('/') ? BASE : BASE + '/';

/**
 * Build a site-relative URL. Pass a path WITHOUT leading slash, or with — both fine.
 *   url('pages/login.html')   -> '/prime-one/pages/login.html'
 *   url('assets/img/x.png')   -> '/prime-one/assets/img/x.png'
 *   url('')                   -> '/prime-one/'
 */
export const url = (path = '') => {
  if (/^https?:\/\//.test(path)) return path; // absolute URL passed through
  if (path.startsWith('#')) return path;
  const clean = path.replace(/^\/+/, '');
  return BASE_PATH + clean;
};

// API base — empty string means same-origin '/api' (the Express app). On GitHub
// Pages there's no backend, so API calls will be intercepted by demo mode.
export const API_BASE = '';

// Demo mode: true when there is no real backend (e.g. GitHub Pages static host).
// Detected by host or by a data attribute on <html data-demo="true">.
export const DEMO_MODE = (() => {
  if (document.documentElement.getAttribute('data-demo') === 'true') return true;
  if (location.hostname.endsWith('github.io')) return true;
  return false;
})();
