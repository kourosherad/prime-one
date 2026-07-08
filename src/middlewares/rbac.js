/**
 * Role-based access control. Usage:
 *   router.delete('/products/:id', auth, rbac('admin'), ...)
 *
 * Accepts a role key from config/constants.ROLES; a user may act if their
 * role level >= the required role level (higher roles inherit lower).
 */
const { ROLE_LEVELS } = require('../config/constants');
const ApiError = require('../utils/apiError');

const rbac = (requiredRole) => {
  const requiredLevel = ROLE_LEVELS[requiredRole];
  if (requiredLevel === undefined) {
    throw new Error(`[rbac] unknown role: ${requiredRole}`);
  }
  return (req, res, next) => {
    if (!req.user) return next(ApiError.unauthorized());
    const userLevel = ROLE_LEVELS[req.user.role];
    if (userLevel === undefined || userLevel < requiredLevel) {
      return next(ApiError.forbidden('سطح دسترسی شما برای این عملیات کافی نیست.'));
    }
    return next();
  };
};

// Convenience: minimum staff (operator or above).
const staff = rbac('operator');

module.exports = rbac;
module.exports.rbac = rbac;
module.exports.staff = staff;
