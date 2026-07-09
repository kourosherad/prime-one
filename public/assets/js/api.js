/**
 * Prime One — frontend API client.
 * Thin fetch wrapper with credentials, JSON parsing, and error normalization.
 *
 * In DEMO_MODE (e.g. GitHub Pages, where there's no backend), GETs to the
 * catalog are served from the bundled demo dataset so the site shows real
 * content. Mutating/auth endpoints surface a clear "backend required" error.
 */
import { API_BASE, DEMO_MODE } from './config.js';
import { demoApi } from './demoData.js';

class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

const request = async (path, { method = 'GET', body, headers = {}, query } = {}) => {
  let url = API_BASE + path;
  if (query) {
    const qs = new URLSearchParams();
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') qs.append(k, v);
    });
    const s = qs.toString();
    if (s) url += (url.includes('?') ? '&' : '?') + s;
  }

  const opts = { method, headers: { ...headers }, credentials: 'include' };
  if (body !== undefined && method !== 'GET') {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(body);
  }

  let res;
  try {
    res = await fetch(url, opts);
  } catch (e) {
    throw new ApiError('خطای شبکه. اتصال اینترنت را بررسی کنید.', 0);
  }

  const isJson = (res.headers.get('content-type') || '').includes('application/json');
  const data = isJson ? await res.json().catch(() => null) : null;

  if (!res.ok) {
    const msg = data?.message || `خطای سرور (${res.status})`;
    throw new ApiError(msg, res.status, data?.details);
  }
  return data;
};

// Demo-mode dispatcher: handle the catalog reads from bundled data; everything
// else fails with a clear message explaining a backend is required.
const demoRequest = (path, { method = 'GET', body, query } = {}) => {
  if (method === 'GET') {
    // Let demoApi resolve it if it knows the path.
    return demoApi(path, query).then((res) => {
      if (res && res.data !== undefined) return res;
      throw new ApiError('این بخش برای مشاهده نیازمند سرور است.', 503);
    });
  }
  // Mutating endpoints (login, register, checkout, ...) need the real backend.
  throw new ApiError('این عملیات در نسخه نمایشی (دمو) در دسترس نیست. برای استفاده کامل، سرور را اجرا کنید.', 503);
};

const dispatch = (path, opts) => (DEMO_MODE ? demoRequest(path, opts) : request(path, opts));

export const api = {
  get: (path, query) => dispatch(path, { method: 'GET', query }),
  post: (path, body, headers) => dispatch(path, { method: 'POST', body, headers }),
  put: (path, body) => dispatch(path, { method: 'PUT', body }),
  patch: (path, body) => dispatch(path, { method: 'PATCH', body }),
  del: (path) => dispatch(path, { method: 'DELETE' }),
};

export { ApiError };
