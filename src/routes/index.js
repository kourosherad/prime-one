/**
 * Route registry. Mounted under /api by app.js.
 */
const express = require('express');
const authRoutes = require('./authRoutes');
const catalogRoutes = require('./catalogRoutes');
const cartRoutes = require('./cartRoutes');
const orderRoutes = require('./orderRoutes');
const { paymentRouter } = require('./orderRoutes');
const accountRoutes = require('./accountRoutes');
const adminRoutes = require('./adminRoutes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/catalog', catalogRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/payment', paymentRouter);
router.use('/account', accountRoutes);
router.use('/admin', adminRoutes);

// Health check.
router.get('/health', (_req, res) =>
  res.json({ success: true, data: { status: 'ok', time: new Date().toISOString() } })
);

module.exports = router;
