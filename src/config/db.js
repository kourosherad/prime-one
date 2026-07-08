/**
 * Knex instance configured for MySQL (mysql2 driver).
 * Used both by the app (models) and by the migration/seed CLI (knexfile).
 */
const knex = require('knex');
const env = require('./env');
const logger = require('./logger');

const config = {
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
  // Convert JS Date -> mysql datetime, and snake_case columns can be mapped later if needed.
  useNullAsDefault: true,
};

const db = knex(config);

db.raw('SELECT 1')
  .then(() => logger.info(`[db] connected to mysql @ ${env.db.host}:${env.db.port}/${env.db.database}`))
  .catch((err) => logger.error(`[db] connection failed: ${err.message}`));

module.exports = db;
module.exports.config = config;
