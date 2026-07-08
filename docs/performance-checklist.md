# Performance Checklist

Implemented ✅ / recommended for scale ⚠️

## Frontend
- ✅ Minified Tailwind output (`npm run build:css`)
- ✅ Lazy-loaded images (`loading="lazy"`, `decoding="async"`)
- ✅ Skeleton loaders + optimistic UI updates
- ✅ Debounced search, infinite/paginated lists
- ✅ Static assets served with cache headers; CDN-ready
- ✅ Vendor libs (GSAP/AOS/Swiper/FontAwesome) via CDN with subresource hints
- ⚠️ Self-host vendor fonts/JS for full control + Subresource Integrity
- ⚠️ Add `<link rel="preload">` for the LCP hero image
- ⚠️ Convert product images to WebP/AVIF + responsive `srcset`

## Backend
- ✅ gzip/brotli via `compression`
- ✅ Connection pooling (mysql2 pool, configurable)
- ✅ Paginated queries (LIMIT/OFFSET) with counted totals
- ✅ DB indexes on hot columns (slug, status, category, FKs, search fields)
- ⚠️ Replace OFFSET pagination with keyset/cursor pagination on large tables
- ⚠️ Cache homepage aggregates + category trees (Redis) with short TTLs

## Data & queries
- ✅ Normalized schema; FKs + indexes; effective-price computed in app, not SQL
- ⚠️ Add materialized/cached `products.effective_price` + rating aggregates
- ⚠️ Move counters (views, sales) to an async increment queue to reduce writes

## Caching & scaling
- ⚠️ Put a CDN / reverse-proxy cache in front of `/` and static assets
- ⚠️ Introduce Redis for sessions, rate-limit store, and response caching
- ⚠️ Horizontal scaling: stateless app behind a load balancer; shared `uploads/`

## Monitoring
- ⚠️ Track p95/p99 latency per endpoint; APM (e.g. OpenTelemetry)
- ⚠️ Slow-query logging in MySQL; review weekly
- ⚠️ Lighthouse CI in the pipeline with a performance budget
