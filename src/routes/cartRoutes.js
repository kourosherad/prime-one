/**
 * Cart routes (pricing/coupon preview). Cart items live client-side.
 */
const express = require('express');
const ctrl = require('../controllers/cartController');
const auth = require('../middlewares/auth');

const router = express.Router();

router.post('/preview', auth({ required: false }), ctrl.preview);
router.post('/coupon', auth({ required: false }), ctrl.applyCoupon);

module.exports = router;
