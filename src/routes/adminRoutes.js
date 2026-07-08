/**
 * Admin routes — all require auth + minimum operator role.
 */
const express = require('express');
const { body } = require('express-validator');
const ctrl = require('../controllers/adminController');
const auth = require('../middlewares/auth');
const rbac = require('../middlewares/rbac');
const validate = require('../middlewares/validate');
const { single, upload } = require('../middlewares/upload');

const router = express.Router();

router.use(auth(), rbac('operator'));

// Overview / dashboard
router.get('/overview', ctrl.overview);
router.get('/sales-chart', ctrl.salesChart);
router.get('/recent-orders', ctrl.recentOrders);
router.get('/recent-activity', ctrl.recentActivity);
router.get('/activity-logs', ctrl.activityLogs);

// Products
router.get('/products', ctrl.listProducts);
router.get('/products/:slug', ctrl.getProduct);
const productFields = () => [
  { name: 'mainImage', maxCount: 1 },
  { name: 'gallery', maxCount: 8 },
];

router.post(
  '/products',
  upload.fields(productFields()),
  validate([body('title').trim().notEmpty(), body('categoryId').isInt(), body('price').isFloat({ min: 0 })]),
  ctrl.createProduct
);
router.put(
  '/products/:id',
  upload.fields(productFields()),
  ctrl.updateProduct
);
router.delete('/products/:id', ctrl.deleteProduct);

// Categories
router.get('/categories', ctrl.listCategories);
router.post('/categories', single('cover'), ctrl.createCategory);
router.put('/categories/:id', single('cover'), ctrl.updateCategory);
router.delete('/categories/:id', ctrl.deleteCategory);

// Orders
router.get('/orders', ctrl.listOrders);
router.get('/orders/:id', ctrl.adminOrder);
router.patch('/orders/:id/status', validate([body('status').notEmpty()]), ctrl.updateOrderStatus);

// Users / customers
router.get('/users', ctrl.listUsers);
router.patch('/users/:id', validate([body('role').optional(), body('status').optional()]), ctrl.updateUser);

// Coupons
router.get('/coupons', ctrl.listCoupons);
router.post(
  '/coupons',
  validate([
    body('code').trim().notEmpty(),
    body('type').isIn(['percent', 'fixed']),
    body('value').isFloat({ min: 0 }),
  ]),
  ctrl.createCoupon
);
router.put('/coupons/:id', ctrl.updateCoupon);
router.delete('/coupons/:id', ctrl.deleteCoupon);

// Transactions
router.get('/transactions', ctrl.listTransactions);

// Settings
router.get('/settings', ctrl.getSettings);
router.put('/settings', ctrl.updateSettings);

module.exports = router;
