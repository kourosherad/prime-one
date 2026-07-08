/**
 * Knex configuration. Reads env via the central env module so the app and
 * the migration/seed CLI share one source of truth.
 */
const env = require('../config/env');
const path = require('path');

module.exports = {
  client: 'mysql2',
  connection: {
    host: env.db.host,
    port: env.db.port,
    user: env.db.user,
    password: env.db.password,
    database: env.db.database,
    timezone: env.db.timezone,
    charset: 'utf8mb4',
  },
  pool: { min: 2, max: env.db.connectionLimit },
  useNullAsDefault: true,

  migrations: {
    directory: path.join(__dirname, 'migrations'),
    extension: 'js',
    tableName: 'knex_migrations',
  },

  seeds: {
    directory: path.join(__dirname, 'seeds'),
  },
};
