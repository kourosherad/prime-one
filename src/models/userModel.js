const BaseModel = require('./base');
const db = require('../config/db');

class UserModel extends BaseModel {
  constructor() {
    super('users');
  }

  findByEmail(email) {
    return db('users').where({ email }).first();
  }

  // Strip sensitive fields for API output.
  static safe(user) {
    if (!user) return null;
    const {
      password_hash,
      refresh_token_hash,
      email_verify_token,
      password_reset_token,
      ...safe
    } = user;
    return safe;
  }

  setRefreshToken(userId, tokenHash) {
    return db('users').where({ id: userId }).update({ refresh_token_hash: tokenHash });
  }

  clearRefreshToken(userId) {
    return db('users').where({ id: userId }).update({ refresh_token_hash: null });
  }

  verifyEmail(userId) {
    return db('users').where({ id: userId }).update({
      email_verified: true,
      email_verify_token: null,
      updated_at: db.fn.now(),
    });
  }

  setPasswordReset(email, token, expires) {
    return db('users').where({ email }).update({
      password_reset_token: token,
      password_reset_expires: expires,
      updated_at: db.fn.now(),
    });
  }

  touchLogin(userId) {
    return db('users').where({ id: userId }).update({
      last_login_at: db.fn.now(),
      updated_at: db.fn.now(),
    });
  }
}

module.exports = new UserModel();
module.exports.UserModel = UserModel;
