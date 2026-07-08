/**
 * Public catalog routes (no auth required for read).
 */
const express = require('express');
const { body } = require('express-validator');
const ctrl = require('../controllers/catalogController');
const validate = require('../middlewares/validate');
const auth = require('../middlewares/auth');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

const h = asyncHandler;

router.get('/', h(ctrl.homeAggregates));

router.get('/categories/tree', h(ctrl.categoryTree));
router.get('/categories', h(ctrl.categoryList));
router.get('/categories/:slug', h(ctrl.categoryBySlug));

router.get('/products', h(ctrl.productList));
router.get('/products/:slug', h(ctrl.productBySlug));

router.get('/products/:productId/reviews', h(ctrl.listReviews));
router.post(
  '/products/:productId/reviews',
  auth(),
  validate([
    body('rating').isInt({ min: 1, max: 5 }).withMessage('امتیاز باید بین ۱ تا ۵ باشد.'),
    body('title').optional().isLength({ max: 200 }),
    body('body').optional().isLength({ max: 2000 }),
  ]),
  h(ctrl.createReview)
);

module.exports = router;
