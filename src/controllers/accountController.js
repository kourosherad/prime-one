/**
 * Account controller: the logged-in customer's own data (profile, addresses,
 * wallet, orders, notifications). Staff-only actions live in adminController.
 */
const db = require('../config/db');
const userModel = require('../models/userModel');
const addressModel = require('../models/addressModel');
const walletModel = require('../models/walletModel');
const orderModel = require('../models/orderModel');
const transactionModel = require('../models/transactionModel');
const notificationModel = require('../models/notificationModel');
const ticketModel = require('../models/ticketModel');
const { hashUtil } = require('../utils/hash');
const { api } = require('../utils/response');
const { pagination } = require('../utils/pagination');
const ApiError = require('../utils/apiError');

// ── Profile ──
exports.profile = async (req, res) => {
  res.json(api.success({ user: req.user }));
};

exports.updateProfile = async (req, res) => {
  const { firstName, lastName, phone, avatarUrl } = req.body;
  await userModel.update(req.user.id, {
    first_name: firstName,
    last_name: lastName,
    phone,
    avatar_url: avatarUrl,
  });
  const user = await userModel.findById(req.user.id);
  res.json(api.success({ user: userModel.constructor.safe(user) }, null, 'پروفایل به‌روزرسانی شد.'));
};

exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await userModel.findById(req.user.id);
  const ok = await hashUtil.compare(currentPassword, user.password_hash);
  if (!ok) throw ApiError.badRequest('رمز عبور فعلی نادرست است.');
  const hash = await hashUtil.hash(newPassword);
  await userModel.update(req.user.id, { password_hash: hash });
  await userModel.clearRefreshToken(req.user.id);
  res.json(api.success(null, null, 'رمز عبور تغییر کرد. لطفاً دوباره وارد شوید.'));
};

// ── Addresses ──
exports.listAddresses = async (req, res) => {
  const rows = await addressModel.forUser(req.user.id);
  res.json(api.success(rows));
};

exports.createAddress = async (req, res) => {
  const { label, recipient, phone, province, city, postalCode, address, isDefault } = req.body;
  const created = await addressModel.create({
    user_id: req.user.id,
    label,
    recipient,
    phone,
    province,
    city,
    postal_code: postalCode,
    address,
    is_default: !!isDefault,
  });
  if (isDefault) await addressModel.setDefault(req.user.id, created.id);
  res.status(201).json(api.success(created, null, 'آدرس ذخیره شد.'));
};

exports.updateAddress = async (req, res) => {
  const existing = await addressModel.findById(req.params.id);
  if (!existing || existing.user_id !== req.user.id) throw ApiError.notFound('آدرس یافت نشد.');
  const { label, recipient, phone, province, city, postalCode, address, isDefault } = req.body;
  await addressModel.update(req.params.id, {
    label,
    recipient,
    phone,
    province,
    city,
    postal_code: postalCode,
    address,
  });
  if (isDefault) await addressModel.setDefault(req.user.id, req.params.id);
  res.json(api.success(await addressModel.findById(req.params.id), null, 'آدرس به‌روزرسانی شد.'));
};

exports.deleteAddress = async (req, res) => {
  const existing = await addressModel.findById(req.params.id);
  if (!existing || existing.user_id !== req.user.id) throw ApiError.notFound('آدرس یافت نشد.');
  await addressModel.delete(req.params.id);
  res.json(api.success(null, null, 'آدرس حذف شد.'));
};

// ── Wallet ──
exports.wallet = async (req, res) => {
  const wallet = await walletModel.ensureForUser(req.user.id);
  res.json(api.success(wallet));
};

exports.walletTransactions = async (req, res) => {
  const wallet = await walletModel.ensureForUser(req.user.id);
  const { page, pageSize } = pagination.parse(req.query);
  const rows = await walletModel.transactions(wallet.id, { page, pageSize });
  res.json(api.success(rows));
};

// ── Orders ──
exports.myOrders = async (req, res) => {
  const { page, pageSize } = pagination.parse(req.query);
  const rows = await orderModel.byUser(req.user.id, { page, pageSize });
  const { count } = await orderModel.countByUser(req.user.id);
  res.json(api.success(rows, api.pagination(Number(count), page, pageSize)));
};

// ── Notifications ──
exports.notifications = async (req, res) => {
  const { page, pageSize } = pagination.parse(req.query);
  const unreadOnly = req.query.unread === 'true';
  const rows = await notificationModel.forUser(req.user.id, { unreadOnly, page, pageSize });
  const { count } = await notificationModel.unreadCount(req.user.id);
  res.json(api.success(rows, { unread: Number(count || 0) }));
};

exports.markNotificationRead = async (req, res) => {
  await notificationModel.markRead(req.params.id);
  res.json(api.success(null, null, 'خوانده شد.'));
};

exports.markAllNotificationsRead = async (req, res) => {
  await notificationModel.markAllRead(req.user.id);
  res.json(api.success(null, null, 'همه نشان شد.'));
};

// ── Tickets (support) ──
exports.myTickets = async (req, res) => {
  const { page, pageSize } = pagination.parse(req.query);
  const rows = await ticketModel.byUser(req.user.id, { page, pageSize });
  res.json(api.success(rows));
};

exports.createTicket = async (req, res) => {
  const { subject, message, priority } = req.body;
  const ticketNumber = require('../utils/random').random.ticketNumber();
  const ids = await db('support_tickets').insert({
    ticket_number: ticketNumber,
    user_id: req.user.id,
    subject,
    priority: priority || 'normal',
    status: 'open',
  });
  const ticketId = ids[0];
  await db('ticket_messages').insert({
    ticket_id: ticketId,
    user_id: req.user.id,
    is_staff: false,
    message,
  });
  res.status(201).json(api.success({ id: ticketId, ticket_number: ticketNumber }, null, 'تیکت ایجاد شد.'));
};

exports.ticketMessages = async (req, res) => {
  const ticket = await ticketModel.withMessages(req.params.id);
  if (!ticket || ticket.user_id !== req.user.id) throw ApiError.notFound('تیکت یافت نشد.');
  res.json(api.success(ticket));
};
