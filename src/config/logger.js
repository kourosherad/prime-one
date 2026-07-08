/**
 * Winston logger. Console in development, JSON to console in production.
 */
const { createLogger, format, transports } = require('winston');
const env = require('./env');

const logger = createLogger({
  level: env.isProd ? 'info' : 'debug',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    env.isProd ? format.json() : format.combine(format.colorize(), format.simple())
  ),
  defaultMeta: { service: 'prime-one' },
  transports: [new transports.Console()],
  exitOnError: false,
});

module.exports = logger;
