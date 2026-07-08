/**
 * Server entrypoint. Boots the Express app.
 */
const createApp = require('./app');
const env = require('./config/env');
const logger = require('./config/logger');

// Global safety nets: log and keep running instead of crashing on an unhandled
// promise rejection or exception. Individual routes should still forward errors
// to the error middleware via asyncHandler; these are last-resort guards.
process.on('unhandledRejection', (reason) => {
  logger.error('[unhandledRejection] ' + (reason && reason.message ? reason.message : reason));
});
process.on('uncaughtException', (err) => {
  logger.error('[uncaughtException] ' + (err && err.stack ? err.stack : err));
});

const app = createApp();

const server = app.listen(env.app.port, () => {
  logger.info(`[${env.app.name}] running on http://localhost:${env.app.port} (${process.env.NODE_ENV || 'development'})`);
});

// Graceful shutdown.
const shutdown = (signal) => {
  logger.info(`[${signal}] shutting down...`);
  server.close(() => {
    logger.info('HTTP server closed.');
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10000).unref();
};
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

module.exports = server;
