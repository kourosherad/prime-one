const jwt = require('jsonwebtoken');
const env = require('../config/env');

const sign = (payload, options = {}) =>
  jwt.sign(payload, env.jwt.secret, {
    expiresIn: options.expiresIn || env.jwt.expiresIn,
  });

const signRefresh = (payload) =>
  jwt.sign(payload, env.jwt.refreshSecret, {
    expiresIn: env.jwt.refreshExpiresIn,
  });

const verify = (token) => jwt.verify(token, env.jwt.secret);
const verifyRefresh = (token) => jwt.verify(token, env.jwt.refreshSecret);

module.exports = { jwtUtil: { sign, signRefresh, verify, verifyRefresh } };
