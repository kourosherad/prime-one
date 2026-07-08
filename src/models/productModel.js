const BaseModel = require('./base');
const db = require('../config/db');
const { pagination } = require('../utils/pagination');

class ProductModel extends BaseModel {
  constructor() {
    super('products');
  }

  // Effective price (discount if active and within window).
  static effectivePrice(p) {
    const now = new Date();
    if (
      p.discount_price != null &&
      Number(p.discount_price) > 0 &&
      Number(p.discount_price) < Number(p.price)
    ) {
      if (!p.discount_until || new Date(p.discount_until) >= now) {
        return Number(p.discount_price);
      }
    }
    return Number(p.price);
  }

  // Full detail by slug with relations.
  async detailBySlug(slug) {
    const product = await db('products').where({ slug }).first();
    if (!product) return null;
    const [category, images, features, tags, faqs, relatedRows] = await Promise.all([
      db('categories').where({ id: product.category_id }).first(),
      db('product_images').where({ product_id: product.id }).orderBy('sort_order'),
      db('product_features').where({ product_id: product.id }).orderBy('sort_order'),
      db('product_tags').where({ product_id: product.id }).pluck('tag'),
      db('product_faqs').where({ product_id: product.id }).orderBy('sort_order'),
      db('products')
        .where({ category_id: product.category_id, status: 'active' })
        .whereNot({ id: product.id })
        .limit(4),
    ]);

    const rating = await db('reviews')
      .where({ product_id: product.id, is_approved: true })
      .avg({ avg: 'rating' })
      .count({ count: '*' })
      .first();

    return {
      ...product,
      effective_price: ProductModel.effectivePrice(product),
      category,
      images,
      features,
      tags,
      faqs,
      related: relatedRows.map((r) => ({
        ...r,
        effective_price: ProductModel.effectivePrice(r),
      })),
      rating: {
        average: rating?.avg ? Math.round(Number(rating.avg) * 10) / 10 : 0,
        count: Number(rating?.count || 0),
      },
    };
  }

  // Listing with filters, sort, search, pagination.
  async list({
    categoryId,
    categorySlug,
    search,
    tag,
    minPrice,
    maxPrice,
    sort = 'newest',
    onlyDiscount = false,
    featured,
    bestseller,
    status = 'active',
    page = 1,
    pageSize = 12,
  } = {}) {
    const { offset, pageSize: ps } = pagination.parse({ page, pageSize });
    let q = db('products');

    if (status) q = q.where('products.status', status);

    if (categoryId) q = q.where('products.category_id', categoryId);
    if (categorySlug) {
      q = q
        .leftJoin('categories as c', 'c.id', 'products.category_id')
        .where('c.slug', categorySlug);
    }
    if (search) {
      q = q.andWhere(function () {
        this.where('products.title', 'like', `%${search}%`)
          .orWhere('products.short_description', 'like', `%${search}%`)
          .orWhere('products.product_code', 'like', `%${search}%`);
      });
    }
    if (tag) {
      q = q.whereExists(function () {
        this.select('*')
          .from('product_tags')
          .whereRaw('product_tags.product_id = products.id')
          .where('product_tags.tag', tag);
      });
    }
    if (minPrice != null) q = q.where('products.price', '>=', minPrice);
    if (maxPrice != null) q = q.where('products.price', '<=', maxPrice);
    if (onlyDiscount) q = q.whereNotNull('products.discount_price').where('products.discount_price', '>', 0);
    if (featured) q = q.where('products.is_featured', true);
    if (bestseller) q = q.where('products.is_bestseller', true);

    // Clone for count before applying pagination/sort in the same chain.
    const countQ = q.clone();
    const total = (await countQ.count({ count: '*' }).first()).count;

    switch (sort) {
      case 'price_asc':
        q = q.orderBy('products.price', 'asc');
        break;
      case 'price_desc':
        q = q.orderBy('products.price', 'desc');
        break;
      case 'popular':
        q = q.orderBy('products.views', 'desc');
        break;
      case 'bestseller':
        q = q.orderBy([{ column: 'products.is_bestseller', order: 'desc' }, { column: 'products.views', order: 'desc' }]);
        break;
      case 'newest':
      default:
        q = q.orderBy('products.created_at', 'desc');
    }

    let rows = await q.limit(ps).offset(offset);
    rows = rows.map((r) => ({ ...r, effective_price: ProductModel.effectivePrice(r) }));
    return { rows, total };
  }

  incrementViews(id) {
    return db('products').where({ id }).increment('views', 1);
  }

  // Aggregates for the homepage + admin.
  async featured(limit = 8) {
    const rows = await db('products')
      .where({ status: 'active', is_featured: true })
      .orderBy('created_at', 'desc')
      .limit(limit);
    return rows.map((r) => ({ ...r, effective_price: ProductModel.effectivePrice(r) }));
  }

  async newest(limit = 8) {
    const rows = await db('products')
      .where({ status: 'active' })
      .orderBy('created_at', 'desc')
      .limit(limit);
    return rows.map((r) => ({ ...r, effective_price: ProductModel.effectivePrice(r) }));
  }

  async bestsellers(limit = 8) {
    const rows = await db('products')
      .where({ status: 'active', is_bestseller: true })
      .orderBy('views', 'desc')
      .limit(limit);
    return rows.map((r) => ({ ...r, effective_price: ProductModel.effectivePrice(r) }));
  }

  async discounted(limit = 8) {
    const rows = await db('products')
      .where({ status: 'active' })
      .whereNotNull('discount_price')
      .where('discount_price', '>', 0)
      .orderBy('discount_price', 'asc')
      .limit(limit);
    return rows.map((r) => ({ ...r, effective_price: ProductModel.effectivePrice(r) }));
  }
}

module.exports = new ProductModel();
module.exports.ProductModel = ProductModel;
