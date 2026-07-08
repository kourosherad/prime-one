/**
 * Catalog controller: public category + product browsing, product detail, reviews.
 */
const categoryModel = require('../models/categoryModel');
const productModel = require('../models/productModel');
const reviewModel = require('../models/reviewModel');
const { api } = require('../utils/response');
const { pagination } = require('../utils/pagination');
const ApiError = require('../utils/apiError');

// ── Categories ──
exports.categoryTree = async (req, res) => {
  const tree = await categoryModel.tree();
  res.json(api.success(tree));
};

exports.categoryList = async (req, res) => {
  const rows = await categoryModel.listWithCounts();
  res.json(api.success(rows));
};

exports.categoryBySlug = async (req, res) => {
  const cat = await categoryModel.bySlug(req.params.slug);
  if (!cat) throw ApiError.notFound('دسته‌بندی یافت نشد.');
  const children = await categoryModel.children(cat.id);
  res.json(api.success({ ...cat, children }));
};

// ── Products ──
exports.productList = async (req, res) => {
  const { page, pageSize } = pagination.parse(req.query);
  const { rows, total } = await productModel.list({
    categoryId: req.query.categoryId,
    categorySlug: req.query.category,
    search: req.query.q || req.query.search,
    tag: req.query.tag,
    minPrice: req.query.minPrice,
    maxPrice: req.query.maxPrice,
    sort: req.query.sort,
    onlyDiscount: req.query.discount === 'true' || req.query.discount === '1',
    featured: req.query.featured === 'true',
    bestseller: req.query.bestseller === 'true',
    page,
    pageSize,
  });
  res.json(api.success(rows, api.pagination(total, page, pageSize)));
};

exports.productBySlug = async (req, res) => {
  const product = await productModel.detailBySlug(req.params.slug);
  if (!product) throw ApiError.notFound('محصول یافت نشد.');
  // View tracking (fire-and-forget).
  productModel.incrementViews(product.id).catch(() => {});
  res.json(api.success(product));
};

// ── Homepage aggregates ──
exports.homeAggregates = async (req, res) => {
  const [featured, newest, bestsellers, discounted, categories] = await Promise.all([
    productModel.featured(8),
    productModel.newest(8),
    productModel.bestsellers(8),
    productModel.discounted(8),
    categoryModel.featured(8),
  ]);
  res.json(
    api.success({
      featured,
      newest,
      bestsellers,
      discounted,
      categories,
    })
  );
};

// ── Reviews ──
exports.listReviews = async (req, res) => {
  const reviews = await reviewModel.forProduct(req.params.productId);
  const agg = await reviewModel.aggregate(req.params.productId);
  res.json(
    api.success(reviews, {
      average: agg?.average ? Math.round(Number(agg.average) * 10) / 10 : 0,
      count: Number(agg?.count || 0),
    })
  );
};

exports.createReview = async (req, res) => {
  const { rating, title, body } = req.body;
  const productId = parseInt(req.params.productId, 10);
  const product = await productModel.findById(productId);
  if (!product) throw ApiError.notFound('محصول یافت نشد.');
  const existing = await reviewModel.hasReviewed(productId, req.user.id);
  if (existing) throw ApiError.conflict('شما قبلاً برای این محصول نظر ثبت کرده‌اید.');

  const review = await reviewModel.create({
    product_id: productId,
    user_id: req.user.id,
    rating: Math.min(5, Math.max(1, parseInt(rating, 10) || 5)),
    title,
    body,
    is_approved: true,
  });
  res.status(201).json(api.success(review, null, 'نظر شما ثبت شد.'));
};
