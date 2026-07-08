/**
 * Domain constants shared across the app.
 */

// User roles ordered by privilege (higher index = more privileged).
const ROLES = {
  CUSTOMER: 'customer',
  OPERATOR: 'operator',
  MANAGER: 'manager',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin',
};

// Role hierarchy for permission checks (a higher role inherits lower ones).
const ROLE_LEVELS = {
  customer: 0,
  operator: 1,
  manager: 2,
  admin: 3,
  super_admin: 4,
};

// A role can act on another if its level is >= the required level.
const MIN_STAFF_ROLE = ROLE_LEVELS.operator;

const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
  PENDING: 'pending',
};

const PRODUCT_STATUS = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  OUT_OF_STOCK: 'out_of_stock',
  DISCONTINUED: 'discontinued',
};

const ORDER_STATUS = {
  PENDING: 'pending',
  AWAITING_PAYMENT: 'awaiting_payment',
  PAID: 'paid',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
  FAILED: 'failed',
};

const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded',
};

const TRANSACTION_TYPE = {
  PAYMENT: 'payment',
  REFUND: 'refund',
  WALLET_TOPUP: 'wallet_topup',
  WALLET_DEBIT: 'wallet_debit',
};

const TICKET_STATUS = {
  OPEN: 'open',
  ANSWERED: 'answered',
  CLOSED: 'closed',
};

const COUPON_TYPE = {
  PERCENT: 'percent',
  FIXED: 'fixed',
};

// Pagination defaults
const DEFAULT_PAGE_SIZE = 12;
const MAX_PAGE_SIZE = 60;

module.exports = {
  ROLES,
  ROLE_LEVELS,
  MIN_STAFF_ROLE,
  USER_STATUS,
  PRODUCT_STATUS,
  ORDER_STATUS,
  PAYMENT_STATUS,
  TRANSACTION_TYPE,
  TICKET_STATUS,
  COUPON_TYPE,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
};
