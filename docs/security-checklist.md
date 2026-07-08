# Security Checklist

Implemented ✅ / recommended for hardening ⚠️

## Authentication & sessions
- ✅ Passwords hashed with bcrypt (configurable rounds, default 12)
- ✅ JWT access tokens (short-lived) + httpOnly refresh cookies
- ✅ Refresh-token rotation; reuse detection invalidates the session
- ✅ Email verification + password reset with expiring tokens
- ✅ Auth routes behind a stricter rate limiter
- ⚠️ Consider adding device/session listing + remote logout (later phase)
- ⚠️ Add CAPTCHA on login/register after N failed attempts

## Transport & headers
- ✅ Helmet (security headers)
- ✅ Secure + SameSite cookies in production
- ✅ CORS allow-list via `CORS_ORIGIN`
- ⚠️ Enforce HSTS in production at the reverse proxy / CDN layer

## Input & output
- ✅ express-validator schemas on every mutating route
- ✅ Centralized error envelope; no stack traces in prod responses
- ⚠️ Add an explicit output-sanitization layer for user-generated HTML (blog,
  rich editor) when those land

## Injection & data
- ✅ All DB access via Knex parameterized queries (no string-concatenated SQL)
- ✅ utf8mb4; strict validation on inputs
- ⚠️ Periodically review raw snippets in models for dynamic columns

## File uploads
- ✅ Multer with MIME + extension allow-list (images only) and size limit
- ✅ Random hashed filenames; written outside `public/` (served via `/uploads`)
- ⚠️ Scan uploads with antivirus / re-encode images server-side for hardening

## Payments
- ✅ ZarinPal verification server-side (no client trust)
- ✅ Transactions logged; idempotency via tracking codes
- ✅ No real gateway secrets in the repo (`.env.example` only)

## Authorization (RBAC)
- ✅ Role hierarchy (customer → operator → manager → admin → super_admin)
- ✅ `auth` + `rbac` middleware; ownership checks on user resources
- ⚠️ Implement the granular per-section permissions editor (later phase)

## Auditing & ops
- ✅ Activity logs for key admin actions
- ✅ Winston structured logging
- ⚠️ Ship logs to a SIEM; alert on repeated 401/403/500 spikes

## Secrets & dependencies
- ⚠️ Rotate `JWT_SECRET` / refresh secrets periodically; never commit `.env`
- ⚠️ Run `npm audit` in CI; pin/upgrade vulnerable deps (multer 1.x → 2.x noted)
- ⚠️ Use a secrets manager in production rather than plaintext `.env` on disk
