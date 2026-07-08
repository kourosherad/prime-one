/**
 * Prime One — frontend API client.
 * Thin fetch wrapper with credentials, JSON parsing, and error normalization.
 */
const BASE = ''; // same origin

const request = async (path, { method = 'GET', body, headers = {}, query } = {}) => {
  let url = BASE + path;
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

class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export const api = {
  get: (path, query) => request(path, { method: 'GET', query }),
  post: (path, body, headers) => request(path, { method: 'POST', body, headers }),
  put: (path, body) => request(path, { method: 'PUT', body }),
  patch: (path, body) => request(path, { method: 'PATCH', body }),
  del: (path) => request(path, { method: 'DELETE' }),
};

export { ApiError };
