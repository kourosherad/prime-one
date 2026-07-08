/**
 * Express application factory. Wires the full security + middleware stack,
 * mounts the REST API under /api, serves the static frontend + uploads.
 */
const path = require('path');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const env = require('./config/env');
const logger = require('./config/logger');
const routes = require('./routes');
const { errorHandler, notFound } = require('./middlewares/error');
const { apiLimiter } = require('./middlewares/rateLimiters');

const createApp = () => {
  const app = express();

  // Trust proxy (so req.ip / secure cookies work behind a reverse proxy).
  app.set('trust proxy', 1);
  app.disable('x-powered-by');

  // ── Security headers ──
  app.use(
    helmet({
      contentSecurityPolicy: env.isProd ? undefined : false,
      crossOriginEmbedderPolicy: false,
    })
  );

  // ── CORS ──
  app.use(
    cors({
      origin: env.app.corsOrigin === '*' ? true : env.app.corsOrigin.split(','),
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    })
  );

  // ── Compression + logging ──
  app.use(compression());
  app.use(
    morgan(env.isProd ? 'combined' : 'dev', {
      skip: (req) => req.url === '/api/health',
    })
  );

  // ── Body parsers ──
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true, limit: '2mb' }));
  app.use(cookieParser(env.app.sessionSecret));

  // ── Static assets ──
  app.use(express.static(path.join(__dirname, '..', 'public'), {
    maxAge: env.isProd ? '7d' : 0,
    extensions: ['html'],
  }));
  app.use(
    '/uploads',
    express.static(path.join(__dirname, '..', env.upload.dir), { maxAge: '7d' })
  );

  // ── Rate limiting (API only) ──
  app.use('/api', apiLimiter);

  // ── REST API ──
  app.use('/api', routes);

  // ── SPA-style fallback for HTML pages (no trailing extension) ──
  // Serve index.html for root.
  app.get('/', (_req, res) => res.sendFile(path.join(__dirname, '..', 'public', 'index.html')));

  // ── 404 + error handlers (must be last) ──
  app.use(notFound);
  app.use(errorHandler);

  return app;
};

module.exports = createApp;
