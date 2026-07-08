# Prime One — REST API Reference

Base URL: `/api` · All responses are JSON with envelope `{ success, message, data, meta }`.
Auth: JWT access token via `Authorization: Bearer <token>` **or** the `access_token`
httpOnly cookie set by login. Refresh token is an httpOnly cookie scoped to `/api/auth`.

## Conventions
- All list endpoints accept `page` and `pageSize` (default 12, max 60) and return
  `meta: { total, page, pageSize, totalPages, hasNext }`.
- Errors: `{ success: false, message, code?, details? }` with appropriate HTTP status
  (400, 401, 403, 404, 409, 422, 500).

---

## Auth — `/api/auth`

| Method | Path                  | Auth | Description |
|--------|-----------------------|------|-------------|
| POST   | `/register`           | —    | Register a customer; returns `{ user, access }` + sets cookies |
| POST   | `/login`              | —    | Login; returns `{ user, access }` + sets cookies |
| POST   | `/refresh`            | cookie | Rotate access token from refresh cookie |
| POST   | `/logout`             | —    | Invalidate refresh token, clear cookies |
| GET    | `/me`                 | user | Current user |
| GET    | `/verify-email?token=`| —    | Verify email (returns HTML confirmation) |
| POST   | `/forgot-password`    | —    | Send reset link (always 200) |
| POST   | `/reset-password`     | —    | Set new password `{ token, password }` |

## Catalog — `/api/catalog`

| Method | Path                                | Auth | Description |
|--------|-------------------------------------|------|-------------|
| GET    | `/`                                 | —    | Homepage aggregates (featured/newest/bestsellers/discounts/categories) |
| GET    | `/categories`                       | —    | Flat category list with product counts |
| GET    | `/categories/tree`                  | —    | Nested category tree |
| GET    | `/categories/:slug`                 | —    | Category by slug + children |
| GET    | `/products`                         | —    | List w/ filters: `category,q,tag,minPrice,maxPrice,sort,discount,featured,bestseller,page,pageSize` |
| GET    | `/products/:slug`                   | —    | Product detail (gallery, features, tags, FAQs, related, rating) |
| GET    | `/products/:productId/reviews`      | —    | Approved reviews + aggregate |
| POST   | `/products/:productId/reviews`      | user | Create review `{ rating, title, body }` |

**Sort values:** `newest` (default), `popular`, `bestseller`, `price_asc`, `price_desc`.

## Cart — `/api/cart`

| Method | Path        | Auth | Description |
|--------|-------------|------|-------------|
| POST   | `/preview`  | optional | Price a cart `{ items: [{productId, quantity}], couponCode?, walletUse? }` |
| POST   | `/coupon`   | optional | Validate coupon against a cart `{ items, couponCode }` |

## Orders & Payment — `/api/orders`, `/api/payment`

| Method | Path                          | Auth | Description |
|--------|-------------------------------|------|-------------|
| POST   | `/orders`                     | user | Create order + initiate payment; returns `{ orderNumber, total, gatewayUrl, authority }` |
| GET    | `/orders/:id`                 | user | Order with items (owner only) |
| GET    | `/orders/by-number/:number`   | user | Order by number (owner only) |
| GET    | `/payment/verify`             | —    | ZarinPal callback; redirects browser to result page |
| GET    | `/payment/status/:track`      | —    | Transaction status JSON |

## Account — `/api/account` (all require auth)

| Method | Path                          | Description |
|--------|-------------------------------|-------------|
| GET    | `/profile`                    | Current profile |
| PUT    | `/profile`                    | Update profile `{ firstName, lastName, phone }` |
| PUT    | `/password`                   | Change password `{ currentPassword, newPassword }` |
| GET    | `/addresses`                  | List addresses |
| POST   | `/addresses`                  | Create address |
| PUT    | `/addresses/:id`              | Update address |
| DELETE | `/addresses/:id`              | Delete address |
| GET    | `/wallet`                     | Wallet balance |
| GET    | `/wallet/transactions`        | Wallet ledger |
| GET    | `/orders`                     | My orders |
| GET    | `/notifications`              | Notifications (`?unread=true`) |
| POST   | `/notifications/:id/read`     | Mark read |
| POST   | `/notifications/read-all`     | Mark all read |
| GET    | `/tickets`                    | My tickets |
| POST   | `/tickets`                    | Create ticket `{ subject, message, priority }` |
| GET    | `/tickets/:id`                | Ticket with messages |

## Admin — `/api/admin` (all require auth + operator role or above)

| Method | Path                          | Description |
|--------|-------------------------------|-------------|
| GET    | `/overview`                   | Dashboard stats |
| GET    | `/sales-chart?days=14`        | Daily sales totals |
| GET    | `/recent-orders`              | Recent orders |
| GET    | `/recent-activity`            | Recent activity logs |
| GET    | `/activity-logs`              | Full activity logs |
| GET    | `/products`                   | List products |
| GET    | `/products/:slug`             | Product detail |
| POST   | `/products`                   | Create (multipart: `mainImage`, `gallery[]`) |
| PUT    | `/products/:id`               | Update |
| DELETE | `/products/:id`               | Delete |
| GET    | `/categories`                 | List categories |
| POST   | `/categories`                 | Create (multipart: `cover`) |
| PUT    | `/categories/:id`             | Update |
| DELETE | `/categories/:id`             | Delete |
| GET    | `/orders`                     | List orders (`?status=`) |
| GET    | `/orders/:id`                 | Order detail |
| PATCH  | `/orders/:id/status`          | Update status `{ status }` |
| GET    | `/users`                      | List users (`?role=,?q=`) |
| PATCH  | `/users/:id`                  | Update user `{ role, status }` |
| GET    | `/coupons`                    | List coupons |
| POST   | `/coupons`                    | Create coupon |
| PUT    | `/coupons/:id`                | Update coupon |
| DELETE | `/coupons/:id`                | Delete coupon |
| GET    | `/transactions`               | List transactions |
| GET    | `/settings`                   | All settings |
| PUT    | `/settings`                   | Update settings (key/value body) |

## Health
`GET /api/health` → `{ success: true, data: { status: "ok", time } }`
