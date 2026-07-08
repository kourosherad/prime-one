const bcrypt = require('bcryptjs');
const env = require('../config/env');

const hash = (plain) => bcrypt.hash(plain, env.jwt.saltRounds);
const compare = (plain, hashed) => bcrypt.compare(plain, hashed);

module.exports = { hashUtil: { hash, compare } };
