const BaseModel = require('./base');
const db = require('../config/db');

class CategoryModel extends BaseModel {
  constructor() {
    super('categories');
  }

  // Build a nested tree of categories.
  async tree() {
    const rows = await db('categories').orderBy([
      { column: 'parent_id', order: 'asc' },
      { column: 'sort_order', order: 'asc' },
      { column: 'id', order: 'asc' },
    ]);
    const byId = {};
    rows.forEach((r) => {
      byId[r.id] = { ...r, children: [] };
    });
    const roots = [];
    rows.forEach((r) => {
      const node = byId[r.id];
      if (r.parent_id && byId[r.parent_id]) {
        byId[r.parent_id].children.push(node);
      } else {
        roots.push(node);
      }
    });
    return roots;
  }

  // Flat list with product counts.
  async listWithCounts() {
    return db('categories as c')
      .select(
        'c.*',
        db.raw('(SELECT COUNT(*) FROM products p WHERE p.category_id = c.id AND p.status = ?) as product_count', ['active'])
      )
      .orderBy([{ column: 'parent_id' }, { column: 'sort_order' }, { column: 'id' }]);
  }

  bySlug(slug) {
    return db('categories').where({ slug }).first();
  }

  // Children of a category (one level).
  children(parentId) {
    return db('categories')
      .where({ parent_id: parentId })
      .orderBy([{ column: 'sort_order' }, { column: 'id' }]);
  }

  // Featured top-level categories for the homepage.
  featured(limit = 8) {
    return db('categories')
      .where({ is_featured: true, parent_id: null })
      .orderBy('sort_order')
      .limit(limit);
  }
}

module.exports = new CategoryModel();
module.exports.CategoryModel = CategoryModel;
