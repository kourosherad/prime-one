/**
 * Account routes — the logged-in customer's own resources. All require auth.
 */
const express = require('express');
const { body } = require('express-validator');
const ctrl = require('../controllers/accountController');
const auth = require('../middlewares/auth');
const validate = require('../middlewares/validate');

const router = express.Router();

router.use(auth());

// Profile
router.get('/profile', ctrl.profile);
router.put(
  '/profile',
  validate([
    body('firstName').optional().trim().notEmpty(),
    body('lastName').optional().trim().notEmpty(),
    body('phone').optional().isMobilePhone('fa-IR'),
  ]),
  ctrl.updateProfile
);
router.put(
  '/password',
  validate([
    body('currentPassword').notEmpty(),
    body('newPassword').isLength({ min: 8 }).withMessage('رمز جدید باید حداقل ۸ کاراکتر باشد.'),
  ]),
  ctrl.changePassword
);

// Addresses
router.get('/addresses', ctrl.listAddresses);
router.post(
  '/addresses',
  validate([
    body('label').trim().notEmpty(),
    body('recipient').trim().notEmpty(),
    body('address').trim().notEmpty(),
  ]),
  ctrl.createAddress
);
router.put('/addresses/:id', ctrl.updateAddress);
router.delete('/addresses/:id', ctrl.deleteAddress);

// Wallet
router.get('/wallet', ctrl.wallet);
router.get('/wallet/transactions', ctrl.walletTransactions);

// Orders
router.get('/orders', ctrl.myOrders);

// Notifications
router.get('/notifications', ctrl.notifications);
router.post('/notifications/:id/read', ctrl.markNotificationRead);
router.post('/notifications/read-all', ctrl.markAllNotificationsRead);

// Support tickets
router.get('/tickets', ctrl.myTickets);
router.post(
  '/tickets',
  validate([body('subject').trim().notEmpty(), body('message').trim().notEmpty()]),
  ctrl.createTicket
);
router.get('/tickets/:id', ctrl.ticketMessages);

module.exports = router;
