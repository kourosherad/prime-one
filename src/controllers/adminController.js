/**
 * Admin controller: staff-only dashboard stats + CRUD.
 * All routes are guarded by auth + rbac('operator') in the router.
 */
const path = require('path');
const db = require('../config/db');
const env = require('../config/env');
const productModel = require('../models/productModel');
const categoryModel = require('../models/categoryModel');
const couponModel = require('../models/couponModel');
const orderModel = require('../models/orderModel');
const transactionModel = require('../models/transactionModel');
const settingModel = require('../models/settingModel');
const activityLogModel = require('../models/activityLogModel');
const { slug } = require('../utils/slug');
const { pagination } = require('../utils/pagination');
const { api } = require('../utils/response');
const ApiError = require('../utils/apiError');
const { PRODUCT_STATUS } = require('../config/constants');

const uploadUrl = (filename) => (filename ? `/uploads/${filename}` : null);

// ── Overview stats ──
exports.overview = async (req, res) => {
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const [products, customers, orders, paidOrders, todaySales, monthRevenue, pendingTickets] = await Promise.all([
    db('products').count({ count: '*' }).first(),
    db('users').where({ role: 'customer' }).count({ count: '*' }).first(),
    db('orders').count({ count: '*' }).first(),
    db('orders').where({ status: 'paid' }).count({ count: '*' }).first(),
    db('orders').where({ status: 'paid' }).andWhere('paid_at', '>=', startOfDay).sum({ total: 'total' }).first(),
    db('orders')
      .where({ status: 'paid' })
      .andWhere('paid_at', '>=', new Date(today.getFullYear(), today.getMonth(), 1))
      .sum({ total: 'total' })
      .first(),
    db('support_tickets').where({ status: 'open' }).count({ count: '*' }).first(),
  ]);

  res.json(
    api.success({
      products: Number(products.count || 0),
      customers: Number(customers.count || 0),
      orders: Number(orders.count || 0),
      paidOrders: Number(paidOrders.count || 0),
      todaySales: Number(todaySales.total || 0),
      monthRevenue: Number(monthRevenue.total || 0),
      pendingTickets: Number(pendingTickets.count || 0),
    })
  );
};

// Sales over last N days for the chart.
exports.salesChart = async (req, res) => {
  const days = Math.min(60, Math.max(7, parseInt(req.query.days, 10) || 14));
  const rows = await db('orders')
    .select(db.raw('DATE(paid_at) as d'), db.raw('SUM(total) as total'), db.raw('COUNT(*) as cnt'))
    .where({ status: 'paid' })
    .andWhere('paid_at', '>=', new Date(Date.now() - days * 24 * 60 * 60 * 1000))
    .groupByRaw('DATE(paid_at)')
    .orderByRaw('DATE(paid_at) asc');
  res.json(api.success(rows));
};

exports.recentOrders = async (req, res) => {
  res.json(api.success(await orderModel.recent(8)));
};

exports.recentActivity = async (req, res) => {
  res.json(api.success(await activityLogModel.recent(20)));
};

// ── Products CRUD ──
exports.listProducts = async (req, res) => {
  const { page, pageSize } = pagination.parse(req.query);
  const { rows, total } = await productModel.list({
    status: req.query.status || null,
    search: req.query.q,
    categoryId: req.query.categoryId,
    page,
    pageSize,
  });
  res.json(api.success(rows, api.pagination(total, page, pageSize)));
};

exports.getProduct = async (req, res) => {
  const product = await productModel.detailBySlug(req.params.slug);
  if (!product) {
    const byId = await productModel.detailBySlug(
      (await productModel.findById(req.params.slug))?.slug
    );
    if (!byId) throw ApiError.notFound('محصول یافت نشد.');
    return res.json(api.success(byId));
  }
  res.json(api.success(product));
};

exports.createProduct = async (req, res) => {
  const {
    title,
    categoryId,
    price,
    discountPrice,
    stock,
    isUnlimited,
    status,
    description,
    shortDescription,
    deliveryHours,
    isFeatured,
    isBestseller,
    features = [],
    tags = [],
    seoTitle,
    seoDescription,
    metaKeywords,
  } = req.body;

  const code = req.body.productCode || `P-${Date.now().toString(36).toUpperCase()}`;
  const baseSlug = slug.slugify(title);
  const productSlug = await slug.unique(baseSlug, async (s) => !!(await productModel.findOne({ slug: s })));

  const mainImage = req.files?.mainImage?.[0] ? uploadUrl(req.files.mainImage[0].filename) : null;

  const ids = await db('products').insert({
    category_id: categoryId,
    uuid: require('uuid').v4(),
    title,
    slug: productSlug,
    description,
    short_description: shortDescription,
    price,
    discount_price: discountPrice || null,
    stock: stock || 0,
    is_unlimited: !!isUnlimited,
    product_code: code,
    main_image: mainImage,
    delivery_hours: deliveryHours || null,
    status: status || PRODUCT_STATUS.ACTIVE,
    is_featured: !!isFeatured,
    is_bestseller: !!isBestseller,
    seo_title: seoTitle,
    seo_description: seoDescription,
    meta_keywords: metaKeywords,
  });
  const productId = ids[0];

  if (features.length) {
    await db('product_features').insert(
      features.map((f, i) => ({ product_id: productId, label: f.label, value: f.value, sort_order: i }))
    );
  }
  if (tags.length) {
    await db('product_tags').insert(tags.map((t) => ({ product_id: productId, tag: t })));
  }
  const gallery = req.files?.gallery || [];
  if (gallery.length) {
    await db('product_images').insert(
      gallery.map((f, i) => ({ product_id: productId, url: uploadUrl(f.filename), sort_order: i }))
    );
  }
  await activityLogModel.log({ userId: req.user.id, action: 'product.create', entityId: productId, meta: { title } });
  res.status(201).json(api.success(await productModel.findById(productId), null, 'محصول ایجاد شد.'));
};

exports.updateProduct = async (req, res) => {
  const product = await productModel.findById(req.params.id);
  if (!product) throw ApiError.notFound('محصول یافت نشد.');
  const fields = [
    'title',
    'categoryId',
    'price',
    'discountPrice',
    'stock',
    'isUnlimited',
    'status',
    'description',
    'shortDescription',
    'deliveryHours',
    'isFeatured',
    'isBestseller',
    'seoTitle',
    'seoDescription',
    'metaKeywords',
  ];
  const update = {};
  for (const f of fields) {
    if (req.body[f] !== undefined) {
      const snake = f.replace(/[A-Z]/g, (m) => '_' + m.toLowerCase());
      update[snake] = req.body[f];
    }
  }
  if (req.files?.mainImage?.[0]) update.main_image = uploadUrl(req.files.mainImage[0].filename);
  await productModel.update(product.id, update);

  if (req.body.features) {
    await db('product_features').where({ product_id: product.id }).delete();
    if (req.body.features.length) {
      await db('product_features').insert(
        req.body.features.map((f, i) => ({ product_id: product.id, label: f.label, value: f.value, sort_order: i }))
      );
    }
  }
  const gallery = req.files?.gallery || [];
  if (gallery.length) {
    await db('product_images').insert(
      gallery.map((f, i) => ({ product_id: product.id, url: uploadUrl(f.filename), sort_order: i }))
    );
  }
  await activityLogModel.log({ userId: req.user.id, action: 'product.update', entityId: product.id });
  res.json(api.success(await productModel.findById(product.id), null, 'محصول به‌روزرسانی شد.'));
};

exports.deleteProduct = async (req, res) => {
  await productModel.delete(req.params.id);
  await activityLogModel.log({ userId: req.user.id, action: 'product.delete', entityId: req.params.id });
  res.json(api.success(null, null, 'محصول حذف شد.'));
};

// ── Categories CRUD ──
exports.listCategories = async (req, res) => {
  res.json(api.success(await categoryModel.listWithCounts()));
};

exports.createCategory = async (req, res) => {
  const { name, parentId, description, icon, isFeatured, sortOrder } = req.body;
  const baseSlug = slug.slugify(name);
  const categorySlug = await slug.unique(baseSlug, async (s) => !!(await categoryModel.findOne({ slug: s })));
  const cover = req.file ? uploadUrl(req.file.filename) : null;
  const created = await categoryModel.create({
    name,
    parent_id: parentId || null,
    slug: categorySlug,
    description,
    icon,
    cover_image: cover,
    is_featured: !!isFeatured,
    sort_order: sortOrder || 0,
  });
  await activityLogModel.log({ userId: req.user.id, action: 'category.create', entityId: created.id });
  res.status(201).json(api.success(created, null, 'دسته‌بندی ایجاد شد.'));
};

exports.updateCategory = async (req, res) => {
  const { name, parentId, description, icon, isFeatured, sortOrder } = req.body;
  const update = {
    name,
    parent_id: parentId || null,
    description,
    icon,
    is_featured: !!isFeatured,
    sort_order: sortOrder,
  };
  if (req.file) update.cover_image = uploadUrl(req.file.filename);
  await categoryModel.update(req.params.id, update);
  await activityLogModel.log({ userId: req.user.id, action: 'category.update', entityId: req.params.id });
  res.json(api.success(await categoryModel.findById(req.params.id), null, 'دسته‌بندی به‌روزرسانی شد.'));
};

exports.deleteCategory = async (req, res) => {
  await categoryModel.delete(req.params.id);
  await activityLogModel.log({ userId: req.user.id, action: 'category.delete', entityId: req.params.id });
  res.json(api.success(null, null, 'دسته‌بندی حذف شد.'));
};

// ── Orders ──
exports.listOrders = async (req, res) => {
  const { page, pageSize } = pagination.parse(req.query);
  let q = db('orders').join('users', 'users.id', 'orders.user_id').select(
    'orders.id',
    'orders.order_number',
    'orders.status',
    'orders.total',
    'orders.created_at',
    'orders.paid_at',
    'users.first_name',
    'users.last_name',
    'users.email'
  );
  if (req.query.status) q = q.where('orders.status', req.query.status);
  const countQ = q.clone();
  const total = (await countQ.count({ count: '*' }).first()).count;
  const rows = await q.orderBy('orders.created_at', 'desc').limit(pageSize).offset((page - 1) * pageSize);
  res.json(api.success(rows, api.pagination(Number(total), page, pageSize)));
};

exports.adminOrder = async (req, res) => {
  const order = await orderModel.withItems(req.params.id);
  if (!order) throw ApiError.notFound('سفارش یافت نشد.');
  res.json(api.success(order));
};

exports.updateOrderStatus = async (req, res) => {
  const { status } = req.body;
  await orderModel.update(req.params.id, { status });
  await activityLogModel.log({ userId: req.user.id, action: 'order.update', entityId: req.params.id, meta: { status } });
  res.json(api.success(await orderModel.findById(req.params.id), null, 'وضعیت سفارش به‌روزرسانی شد.'));
};

// ── Customers ──
exports.listUsers = async (req, res) => {
  const { page, pageSize } = pagination.parse(req.query);
  let q = db('users').select(
    'id',
    'uuid',
    'first_name',
    'last_name',
    'email',
    'phone',
    'role',
    'status',
    'email_verified',
    'created_at',
    'last_login_at'
  );
  if (req.query.role) q = q.where('role', req.query.role);
  if (req.query.q) {
    q = q.andWhere(function () {
      this.where('email', 'like', `%${req.query.q}%`)
        .orWhere('first_name', 'like', `%${req.query.q}%`)
        .orWhere('last_name', 'like', `%${req.query.q}%`);
    });
  }
  const total = (await q.clone().count({ count: '*' }).first()).count;
  const rows = await q.orderBy('created_at', 'desc').limit(pageSize).offset((page - 1) * pageSize);
  res.json(api.success(rows, api.pagination(Number(total), page, pageSize)));
};

exports.updateUser = async (req, res) => {
  const { role, status } = req.body;
  await db('users').where({ id: req.params.id }).update({ role, status, updated_at: db.fn.now() });
  await activityLogModel.log({ userId: req.user.id, action: 'user.update', entityId: req.params.id, meta: { role, status } });
  res.json(api.success(null, null, 'کاربر به‌روزرسانی شد.'));
};

// ── Coupons ──
exports.listCoupons = async (req, res) => {
  res.json(api.success(await couponModel.all({ orderBy: { column: 'id', order: 'desc' } })));
};

exports.createCoupon = async (req, res) => {
  const { code, type, value, minSubtotal, maxDiscount, usageLimit, startsAt, expiresAt, isActive } = req.body;
  const created = await couponModel.create({
    code: String(code).toUpperCase(),
    type,
    value,
    min_subtotal: minSubtotal || null,
    max_discount: maxDiscount || null,
    usage_limit: usageLimit || null,
    starts_at: startsAt || null,
    expires_at: expiresAt || null,
    is_active: isActive !== false,
  });
  res.status(201).json(api.success(created, null, 'کد تخفیف ایجاد شد.'));
};

exports.updateCoupon = async (req, res) => {
  const { value, usageLimit, startsAt, expiresAt, isActive, maxDiscount, minSubtotal } = req.body;
  await couponModel.update(req.params.id, {
    value,
    usage_limit: usageLimit,
    starts_at: startsAt,
    expires_at: expiresAt,
    is_active: isActive,
    max_discount: maxDiscount,
    min_subtotal: minSubtotal,
  });
  res.json(api.success(await couponModel.findById(req.params.id), null, 'کد تخفیف به‌روزرسانی شد.'));
};

exports.deleteCoupon = async (req, res) => {
  await couponModel.delete(req.params.id);
  res.json(api.success(null, null, 'کد تخفیف حذف شد.'));
};

// ── Transactions ──
exports.listTransactions = async (req, res) => {
  const { page, pageSize } = pagination.parse(req.query);
  const q = db('transactions').join('users', 'users.id', 'transactions.user_id').select(
    'transactions.id',
    'tracking_code',
    'gateway',
    'type',
    'transactions.status',
    'amount',
    'reference_id',
    'transactions.created_at',
    'paid_at',
    'users.first_name',
    'users.last_name',
    'users.email'
  );
  const total = (await q.clone().count({ count: '*' }).first()).count;
  const rows = await q.orderBy('transactions.created_at', 'desc').limit(pageSize).offset((page - 1) * pageSize);
  res.json(api.success(rows, api.pagination(Number(total), page, pageSize)));
};

// ── Settings ──
exports.getSettings = async (req, res) => {
  res.json(api.success(await settingModel.allAsObject()));
};

exports.updateSettings = async (req, res) => {
  const items = Object.entries(req.body).map(([key, value]) => ({ key, value: String(value) }));
  await settingModel.setMany(items);
  res.json(api.success(await settingModel.allAsObject(), null, 'تنظیمات ذخیره شد.'));
};

// ── Activity logs ──
exports.activityLogs = async (req, res) => {
  res.json(api.success(await activityLogModel.recent(100)));
};
