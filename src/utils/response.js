/**
 * Standardized API response envelope helpers.
 * Controllers return res.json(api.success(data)) etc.; the error middleware
 * uses api.error() for failures.
 */
const success = (data, meta, message) => ({
  success: true,
  message: message || undefined,
  data: data === undefined ? null : data,
  meta: meta || undefined,
});

const error = (message, code, details) => ({
  success: false,
  message: message || 'خطایی رخ داد.',
  code: code || undefined,
  details: details || undefined,
});

// Pagination meta builder.
const pagination = (total, page, pageSize) => ({
  total,
  page,
  pageSize,
  totalPages: Math.ceil(total / pageSize),
  hasNext: page * pageSize < total,
});

module.exports = { api: { success, error, pagination } };
