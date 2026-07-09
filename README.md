# Prime One — مرجع خرید اشتراک و سرویس‌های بین‌المللی

Production-ready, Persian (RTL) e-commerce platform for selling international
subscriptions and digital services. Built with Node.js, Express, MySQL, and a
premium static frontend (Tailwind + GSAP/AOS/Swiper).

> **Phase 1 — Runnable core.** This delivers a complete, locally-runnable
> foundation that exercises every major seam: auth, catalog, cart, payment
> (ZarinPal), admin + user dashboards, and a premium RTL storefront. See
> [Scope & roadmap](#scope--roadmap) for what's included and what's deferred.

---

## Tech stack

| Layer        | Technology |
|--------------|------------|
| Frontend     | HTML5, Tailwind CSS, Vanilla JS (ES modules), GSAP, AOS, Swiper, Chart.js, Font Awesome |
| Backend      | Node.js, Express |
| Database     | MySQL (via Knex query builder + mysql2) |
| Auth         | JWT access tokens + httpOnly refresh cookies, bcrypt |
| Payments     | ZarinPal (pluggable gateway abstraction) |
| Architecture | MVC (Controllers / Models / Routes / Middlewares / Services / Utils / Config) |

---

## Quick start

### Prerequisites
- Node.js **18+** (built/tested on Node 22)
- A **MySQL** server (external or local) and credentials for it
- npm 9+

### 1. Install
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# then edit .env and fill in at minimum:
#   DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME
#   JWT_SECRET, JWT_REFRESH_SECRET  (use long random strings)
#   ZARINPAL_MERCHANT_ID            (sandbox works with the default 000... id)
```

### 3. Database setup
Create the database (the app does not create it for you), then run migrations
and seeds:
```bash
# in MySQL: CREATE DATABASE prime_one CHARACTER SET utf8mb4;
npm run migrate
npm run seed
```

### 4. Build frontend CSS (first time, or after editing Tailwind classes)
```bash
npm run build:css
# or, during development:
npm run watch:css
```

### 5. Run
```bash
npm run dev      # development (nodemon)
# or
npm start        # production
```
App runs at **http://localhost:3000**.

### Demo accounts (created by the seed)
| Role          | Email                   | Password          |
|---------------|-------------------------|-------------------|
| Super Admin   | admin@primeone.local    | `Admin@123456`    |
| Customer      | customer@primeone.local | `Customer@123456` |

---

## Project structure

```
prime-one/
├── public/                  # Static frontend (served by Express)
│   ├── index.html           # Homepage
│   ├── pages/               # product, category, cart, checkout, account, admin/...
│   ├── assets/
│   │   ├── css/             # tailwind.css (source) + app.css
│   │   ├── dist/            # compiled tailwind.css (generated)
│   │   └── js/              # ES modules: api, store, helpers, partials, pages/
│   ├── manifest.json sw.js  # PWA
│   └── favicon.svg
├── src/
│   ├── server.js            # entrypoint
│   ├── app.js               # Express factory (security + middleware stack)
│   ├── config/              # env, db (knex), logger, constants
│   ├── models/              # data-access layer (knex queries)
│   ├── controllers/         # request handlers
│   ├── routes/              # /api/* route definitions
│   ├── middlewares/         # auth, rbac, validate, upload, error, rate limiters
│   ├── services/            # auth, mail, cart, payment/ (ZarinPal + interface)
│   ├── utils/               # jwt, hash, jalali, persian, slug, pagination, ...
│   └── database/            # knexfile + migrations + seeds
├── uploads/                 # user-uploaded media (gitignored)
├── docs/                    # API, deployment, security/performance checklists
├── tailwind.config.js
└── package.json
```

---

## REST API

All endpoints are under `/api`. Responses use a standard envelope:
```json
{ "success": true, "message": "...", "data": { ... }, "meta": { ... } }
```
Errors:
```json
{ "success": false, "message": "...", "code": "VALIDATION_ERROR", "details": { ... } }
```

Full endpoint reference: [`docs/API.md`](docs/API.md).

Highlights:
- **Auth**: `/api/auth/{register,login,logout,refresh,me,verify-email,forgot-password,reset-password}`
- **Catalog**: `/api/catalog`, `/api/catalog/categories`, `/api/catalog/products`, `/api/catalog/products/:slug`
- **Cart/Checkout**: `/api/cart/preview`, `/api/orders`, `/api/payment/verify`
- **Account**: `/api/account/{profile,wallet,orders,addresses,notifications,tickets}`
- **Admin** (staff only): `/api/admin/{overview,products,categories,orders,users,coupons,transactions,settings}`

---

## Payment integration (ZarinPal)

The gateway layer is pluggable. `services/payment/PaymentGateway.js` defines the
interface (`createPayment`, `verifyPayment`, `refundPayment`); `ZarinPalGateway.js`
implements it against the ZarinPal v4 REST API. Adding another gateway = one new
class + one line in the factory (`services/payment/index.js`).

Flow:
1. `POST /api/orders` validates the cart, creates an `awaiting_payment` order,
   calls the gateway, and returns `gatewayUrl`.
2. User is redirected to ZarinPal; on return ZarinPal calls
   `GET /api/payment/verify?track=...&Authority=...&Status=OK`.
3. The server verifies with ZarinPal, marks order + transaction `paid`, and
   redirects the browser to a result page.

**Sandbox:** keep `ZARINPAL_SANDBOX=true` for development. No real keys are
shipped — only `.env.example`.

---

## Theming & RTL

- Full RTL (`dir="rtl"`, Persian fonts: Vazirmatn / IRANSansX).
- Dark/light toggle, persisted in `localStorage` (`po_theme`).
- Color palette: primary `#FFB300`, black `#000`, gray `#808080`, white `#FFF`.
- Tailwind tokens are centralized in `tailwind.config.js`; custom component
  classes (`.glass`, `.btn-primary`, `.skeleton`, ...) in
  `public/assets/css/tailwind.css`.

---

## NPM scripts

| Script              | Description |
|---------------------|-------------|
| `npm run dev`       | Start with nodemon (auto-reload) |
| `npm start`         | Start production server |
| `npm run migrate`   | Run database migrations |
| `npm run seed`      | Seed demo data |
| `npm run migrate:rollback` | Roll back the last migration batch |
| `npm run build:css` | Compile + minify Tailwind |
| `npm run watch:css` | Watch + rebuild Tailwind on change |
| `npm run lint`      | ESLint |
| `npm run format`    | Prettier |

---

## Scope & roadmap

**Phase 1 (this release) — included:**
- Auth (JWT + refresh rotation, email verify, password reset)
- Catalog: categories (nested), products with gallery/features/tags/FAQs, reviews + ratings
- Cart (client-side) with server-side pricing, coupon + wallet math
- Checkout → ZarinPal payment → verification → order completion
- User dashboard: profile, addresses, orders, wallet, notifications, support tickets
- Admin dashboard: overview + sales chart, products CRUD (with image upload), orders,
  customers, coupons, categories, transactions, site settings
- Premium RTL storefront: animated hero, categories, bestsellers, newest, discounts,
  testimonials (Swiper), FAQ, animated counters, glassmorphism, dark/light, PWA manifest
- Security: Helmet, rate limiting, input validation, bcrypt, secure cookies, audit logs

**Deferred to later phases** (the schema and service seams already support these
without rework):
- Blog/CMS system, full drag-and-drop homepage builder
- Full RBAC permissions matrix editor, granular per-section staff permissions
- Analytics & visitor tracking, Excel/PDF exports
- Media library / file manager, DB backup/restore UI
- Cron jobs & email queue, full PWA offline, complete SEO suite
  (dynamic sitemap, schema.org JSON-LD, OG/Twitter), SMS templates, refund flow,
  shipping/tax

---

## Documentation
- [API reference](docs/API.md)
- [Deployment guide](docs/deployment.md)
- [Security checklist](docs/security-checklist.md)
- [Performance checklist](docs/performance-checklist.md)

---

## GitHub Pages (static demo)

The storefront is also published as a **static demo** on GitHub Pages so the UI
is viewable without running the backend:

> **https://kourosherad.github.io/prime-one/**

In this demo mode the site serves bundled sample data (categories, products,
reviews) instead of calling the API, and clearly badges itself as a demo.
Features that require a server (login, real checkout, payments, admin data) are
not functional in the static demo — run the full app locally for those.

**How it works:** pushing to `main` triggers [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml),
which runs `node scripts/build-pages.js`. That script copies `public/` into
`dist-pages/`, rewrites all asset/page paths to the `/prime-one/` base, enables
demo mode (`data-demo="true"`), and publishes the result to Pages.

Preview the build locally:
```bash
npm run build:pages
npx serve dist-pages      # or any static file server
```

> Note: GitHub Pages serves the **frontend only**. It cannot run Node/Express or
> MySQL, so the live URL is a visual showcase, not a working store.

---

## License
Proprietary — All rights reserved.
