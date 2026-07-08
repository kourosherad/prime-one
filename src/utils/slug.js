/**
 * Persian-aware slugify. Keeps Persian/Arabic letters and digits, lowercases
 * latin, replaces spaces and separators with '-'.
 */
const slugify = (value) =>
  String(value == null ? '' : value)
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/[()،,؛.!?]+/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();

// Ensure uniqueness against a "exists" predicate.
const unique = async (base, exists) => {
  let slug = slugify(base);
  if (!(await exists(slug))) return slug;
  let i = 2;
  while (await exists(slug + '-' + i)) i += 1;
  return slug + '-' + i;
};

module.exports = { slug: { slugify, unique } };
