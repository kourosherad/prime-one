const crypto = require('crypto');

// URL-safe random token for email verification / password reset.
const token = (bytes = 32) => crypto.randomBytes(bytes).toString('hex');

// Numeric / alphanumeric human-readable codes (order numbers, ticket numbers).
const numeric = (len = 8) =>
  Array.from({ length: len }, () => Math.floor(Math.random() * 10)).join('');

const alnum = (len = 10) => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

// Order number like PO-YYYYMMDD-XXXX
const orderNumber = () => {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(
    d.getDate()
  ).padStart(2, '0')}`;
  return `PO-${ymd}-${numeric(4)}`;
};

const ticketNumber = () => `TK-${alnum(8)}`;
const trackingCode = () => `TRK-${alnum(16)}`;

module.exports = { random: { token, numeric, alnum, orderNumber, ticketNumber, trackingCode } };
