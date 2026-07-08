/**
 * Parse + clamp pagination params from a query object.
 */
const { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } = require('../config/constants');

const parse = (query = {}) => {
  let page = parseInt(query.page, 10);
  let pageSize = parseInt(query.pageSize || query.limit, 10);
  if (!page || page < 1) page = 1;
  if (!pageSize || pageSize < 1) pageSize = DEFAULT_PAGE_SIZE;
  if (pageSize > MAX_PAGE_SIZE) pageSize = MAX_PAGE_SIZE;
  return { page, pageSize, offset: (page - 1) * pageSize };
};

module.exports = { pagination: { parse } };
