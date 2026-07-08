/**
 * Prime One — initial schema.
 * Fully normalized MySQL with FKs, indexes, and constraints. utf8mb4 throughout.
 *
 * Run with: npm run migrate
 */
const { ROLE_LEVELS } = require('../../config/constants');

const TABLES = {};

exports.up = async (knex) => {
  // ── users ──────────────────────────────────────────────
  await knex.schema.createTable('users', (t) => {
    t.bigint('id').unsigned().primary().autoIncrement();
    t.string('uuid', 36).notNullable().unique();
    t.string('first_name', 80).notNullable();
    t.string('last_name', 80).notNullable();
    t.string('email', 190).notNullable().unique();
    t.string('phone', 32).nullable();
    t.string('password_hash', 255).notNullable();
    t.enum('role', Object.keys(ROLE_LEVELS)).notNullable().defaultTo('customer');
    t.enum('status', ['active', 'inactive', 'suspended', 'pending']).notNullable().defaultTo('active');
    t.boolean('email_verified').notNullable().defaultTo(false);
    t.string('email_verify_token', 64).nullable();
    t.string('password_reset_token', 64).nullable();
    t.datetime('password_reset_expires').nullable();
    t.string('avatar_url', 500).nullable();
    t.string('refresh_token_hash', 255).nullable(); // hash of current refresh token
    t.datetime('last_login_at').nullable();
    t.datetime('created_at').notNullable().defaultTo(knex.fn.now());
    t.datetime('updated_at').notNullable().defaultTo(knex.fn.now());

    t.index('role');
    t.index('status');
    t.index('email_verify_token');
    t.index('password_reset_token');
  });

  // ── user_addresses ─────────────────────────────────────
  await knex.schema.createTable('user_addresses', (t) => {
    t.bigint('id').unsigned().primary().autoIncrement();
    t.bigint('user_id').unsigned().notNullable();
    t.string('label', 60).notNullable();
    t.string('recipient', 120).notNullable();
    t.string('phone', 32).nullable();
    t.string('province', 80).nullable();
    t.string('city', 80).nullable();
    t.string('postal_code', 20).nullable();
    t.text('address').notNullable();
    t.boolean('is_default').notNullable().defaultTo(false);
    t.datetime('created_at').notNullable().defaultTo(knex.fn.now());
    t.datetime('updated_at').notNullable().defaultTo(knex.fn.now());

    t.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
    t.index('user_id');
  });

  // ── categories (self-referential) ──────────────────────
  await knex.schema.createTable('categories', (t) => {
    t.bigint('id').unsigned().primary().autoIncrement();
    t.bigint('parent_id').unsigned().nullable();
    t.string('name', 120).notNullable();
    t.string('slug', 160).notNullable().unique();
    t.text('description').nullable();
    t.string('icon', 60).nullable(); // Font Awesome class, e.g. "fa-robot"
    t.string('cover_image', 500).nullable();
    t.boolean('is_featured').notNullable().defaultTo(false);
    t.integer('sort_order').notNullable().defaultTo(0);
    t.datetime('created_at').notNullable().defaultTo(knex.fn.now());
    t.datetime('updated_at').notNullable().defaultTo(knex.fn.now());

    t.foreign('parent_id').references('id').inTable('categories').onDelete('SET NULL');
    t.index('parent_id');
    t.index('slug');
    t.index('is_featured');
  });

  // ── products ───────────────────────────────────────────
  await knex.schema.createTable('products', (t) => {
    t.bigint('id').unsigned().primary().autoIncrement();
    t.string('uuid', 36).notNullable().unique();
    t.bigint('category_id').unsigned().notNullable();
    t.string('title', 200).notNullable();
    t.string('slug', 240).notNullable().unique();
    t.text('description').nullable();
    t.text('short_description').nullable();
    t.decimal('price', 14, 0).notNullable().defaultTo(0); // toman, integer cents unnecessary
    t.decimal('discount_price', 14, 0).nullable();
    t.integer('stock').notNullable().defaultTo(0);
    t.boolean('is_unlimited').notNullable().defaultTo(false);
    t.string('product_code', 80).notNullable().unique();
    t.string('main_image', 500).nullable();
    t.integer('delivery_hours').nullable(); // estimated delivery time in hours
    t.enum('status', ['draft', 'active', 'out_of_stock', 'discontinued']).notNullable().defaultTo('active');
    t.boolean('is_featured').notNullable().defaultTo(false);
    t.boolean('is_bestseller').notNullable().defaultTo(false);
    t.datetime('discount_until').nullable();
    t.string('seo_title', 200).nullable();
    t.string('seo_description', 320).nullable();
    t.string('meta_keywords', 300).nullable();
    t.integer('views').notNullable().defaultTo(0);
    t.integer('sort_order').notNullable().defaultTo(0);
    t.datetime('created_at').notNullable().defaultTo(knex.fn.now());
    t.datetime('updated_at').notNullable().defaultTo(knex.fn.now());

    t.foreign('category_id').references('id').inTable('categories').onDelete('RESTRICT');
    t.index('category_id');
    t.index('slug');
    t.index('status');
    t.index(['is_featured', 'status']);
    t.index(['is_bestseller', 'status']);
  });

  // ── product_images (gallery) ───────────────────────────
  await knex.schema.createTable('product_images', (t) => {
    t.bigint('id').unsigned().primary().autoIncrement();
    t.bigint('product_id').unsigned().notNullable();
    t.string('url', 500).notNullable();
    t.string('alt', 200).nullable();
    t.integer('sort_order').notNullable().defaultTo(0);
    t.datetime('created_at').notNullable().defaultTo(knex.fn.now());

    t.foreign('product_id').references('id').inTable('products').onDelete('CASCADE');
    t.index('product_id');
  });

  // ── product_features ───────────────────────────────────
  await knex.schema.createTable('product_features', (t) => {
    t.bigint('id').unsigned().primary().autoIncrement();
    t.bigint('product_id').unsigned().notNullable();
    t.string('label', 120).notNullable();
    t.text('value').nullable();
    t.integer('sort_order').notNullable().defaultTo(0);

    t.foreign('product_id').references('id').inTable('products').onDelete('CASCADE');
    t.index('product_id');
  });

  // ── product_tags (simple key-value-ish via join-free tags table) ──
  await knex.schema.createTable('product_tags', (t) => {
    t.bigint('id').unsigned().primary().autoIncrement();
    t.bigint('product_id').unsigned().notNullable();
    t.string('tag', 80).notNullable();

    t.foreign('product_id').references('id').inTable('products').onDelete('CASCADE');
    t.unique(['product_id', 'tag']);
    t.index('tag');
  });

  // ── product_faqs ───────────────────────────────────────
  await knex.schema.createTable('product_faqs', (t) => {
    t.bigint('id').unsigned().primary().autoIncrement();
    t.bigint('product_id').unsigned().notNullable();
    t.string('question', 300).notNullable();
    t.text('answer').nullable();
    t.integer('sort_order').notNullable().defaultTo(0);

    t.foreign('product_id').references('id').inTable('products').onDelete('CASCADE');
    t.index('product_id');
  });

  // ── reviews ────────────────────────────────────────────
  await knex.schema.createTable('reviews', (t) => {
    t.bigint('id').unsigned().primary().autoIncrement();
    t.bigint('product_id').unsigned().notNullable();
    t.bigint('user_id').unsigned().notNullable();
    t.tinyint('rating').unsigned().notNullable(); // 1..5
    t.string('title', 200).nullable();
    t.text('body').nullable();
    t.boolean('is_approved').notNullable().defaultTo(true);
    t.datetime('created_at').notNullable().defaultTo(knex.fn.now());
    t.datetime('updated_at').notNullable().defaultTo(knex.fn.now());

    t.foreign('product_id').references('id').inTable('products').onDelete('CASCADE');
    t.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
    t.unique(['product_id', 'user_id']); // one review per user per product
    t.index('product_id');
    t.index(['product_id', 'is_approved']);
  });

  // ── coupons ────────────────────────────────────────────
  await knex.schema.createTable('coupons', (t) => {
    t.bigint('id').unsigned().primary().autoIncrement();
    t.string('code', 40).notNullable().unique();
    t.enum('type', ['percent', 'fixed']).notNullable();
    t.decimal('value', 14, 0).notNullable();
    t.decimal('min_subtotal', 14, 0).nullable();
    t.decimal('max_discount', 14, 0).nullable();
    t.integer('usage_limit').nullable();
    t.integer('used_count').notNullable().defaultTo(0);
    t.datetime('starts_at').nullable();
    t.datetime('expires_at').nullable();
    t.boolean('is_active').notNullable().defaultTo(true);
    t.datetime('created_at').notNullable().defaultTo(knex.fn.now());
    t.datetime('updated_at').notNullable().defaultTo(knex.fn.now());

    t.index('code');
    t.index('is_active');
  });

  // ── orders ─────────────────────────────────────────────
  await knex.schema.createTable('orders', (t) => {
    t.bigint('id').unsigned().primary().autoIncrement();
    t.string('order_number', 24).notNullable().unique();
    t.bigint('user_id').unsigned().notNullable();
    t.enum('status', [
      'pending',
      'awaiting_payment',
      'paid',
      'processing',
      'completed',
      'cancelled',
      'refunded',
      'failed',
    ]).notNullable().defaultTo('pending');
    t.decimal('subtotal', 14, 0).notNullable().defaultTo(0);
    t.decimal('discount', 14, 0).notNullable().defaultTo(0);
    t.decimal('wallet_used', 14, 0).notNullable().defaultTo(0);
    t.decimal('tax', 14, 0).notNullable().defaultTo(0);
    t.decimal('total', 14, 0).notNullable().defaultTo(0);
    t.string('coupon_code', 40).nullable();
    t.text('note').nullable();
    t.datetime('paid_at').nullable();
    t.datetime('created_at').notNullable().defaultTo(knex.fn.now());
    t.datetime('updated_at').notNullable().defaultTo(knex.fn.now());

    t.foreign('user_id').references('id').inTable('users').onDelete('RESTRICT');
    t.index('user_id');
    t.index('order_number');
    t.index('status');
  });

  // ── order_items ────────────────────────────────────────
  await knex.schema.createTable('order_items', (t) => {
    t.bigint('id').unsigned().primary().autoIncrement();
    t.bigint('order_id').unsigned().notNullable();
    t.bigint('product_id').unsigned().nullable(); // nullable to keep history if product deleted
    t.string('product_title', 200).notNullable();
    t.string('product_code', 80).nullable();
    t.string('product_image', 500).nullable();
    t.decimal('unit_price', 14, 0).notNullable();
    t.integer('quantity').notNullable().defaultTo(1);
    t.decimal('line_total', 14, 0).notNullable();

    t.foreign('order_id').references('id').inTable('orders').onDelete('CASCADE');
    t.foreign('product_id').references('id').inTable('products').onDelete('SET NULL');
    t.index('order_id');
    t.index('product_id');
  });

  // ── transactions (payments / refunds / wallet) ─────────
  await knex.schema.createTable('transactions', (t) => {
    t.bigint('id').unsigned().primary().autoIncrement();
    t.string('tracking_code', 64).notNullable().unique();
    t.bigint('order_id').unsigned().nullable();
    t.bigint('user_id').unsigned().notNullable();
    t.enum('gateway', ['zarinpal', 'wallet', 'manual']).notNullable();
    t.enum('type', ['payment', 'refund', 'wallet_topup', 'wallet_debit']).notNullable();
    t.enum('status', ['pending', 'paid', 'failed', 'refunded']).notNullable().defaultTo('pending');
    t.decimal('amount', 14, 0).notNullable();
    t.string('authority', 80).nullable(); // zarinpal authority
    t.string('reference_id', 80).nullable(); // zarinpal ref_id on success
    t.text('description').nullable();
    t.json('gateway_response').nullable();
    t.datetime('paid_at').nullable();
    t.datetime('created_at').notNullable().defaultTo(knex.fn.now());
    t.datetime('updated_at').notNullable().defaultTo(knex.fn.now());

    t.foreign('order_id').references('id').inTable('orders').onDelete('SET NULL');
    t.foreign('user_id').references('id').inTable('users').onDelete('RESTRICT');
    t.index('order_id');
    t.index('user_id');
    t.index('status');
    t.index('authority');
  });

  // ── wallets ────────────────────────────────────────────
  await knex.schema.createTable('wallets', (t) => {
    t.bigint('id').unsigned().primary().autoIncrement();
    t.bigint('user_id').unsigned().notNullable().unique();
    t.decimal('balance', 14, 0).notNullable().defaultTo(0);
    t.datetime('created_at').notNullable().defaultTo(knex.fn.now());
    t.datetime('updated_at').notNullable().defaultTo(knex.fn.now());

    t.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
  });

  // ── wallet_transactions ────────────────────────────────
  await knex.schema.createTable('wallet_transactions', (t) => {
    t.bigint('id').unsigned().primary().autoIncrement();
    t.bigint('wallet_id').unsigned().notNullable();
    t.enum('direction', ['credit', 'debit']).notNullable();
    t.decimal('amount', 14, 0).notNullable();
    t.decimal('balance_after', 14, 0).notNullable();
    t.string('reason', 120).nullable();
    t.bigint('transaction_id').unsigned().nullable();
    t.datetime('created_at').notNullable().defaultTo(knex.fn.now());

    t.foreign('wallet_id').references('id').inTable('wallets').onDelete('CASCADE');
    t.foreign('transaction_id').references('id').inTable('transactions').onDelete('SET NULL');
    t.index('wallet_id');
  });

  // ── notifications ──────────────────────────────────────
  await knex.schema.createTable('notifications', (t) => {
    t.bigint('id').unsigned().primary().autoIncrement();
    t.bigint('user_id').unsigned().notNullable();
    t.string('type', 60).notNullable();
    t.string('title', 200).notNullable();
    t.text('body').nullable();
    t.string('link', 500).nullable();
    t.boolean('is_read').notNullable().defaultTo(false);
    t.datetime('created_at').notNullable().defaultTo(knex.fn.now());

    t.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
    t.index(['user_id', 'is_read']);
  });

  // ── support_tickets ────────────────────────────────────
  await knex.schema.createTable('support_tickets', (t) => {
    t.bigint('id').unsigned().primary().autoIncrement();
    t.string('ticket_number', 20).notNullable().unique();
    t.bigint('user_id').unsigned().notNullable();
    t.string('subject', 200).notNullable();
    t.enum('status', ['open', 'answered', 'closed']).notNullable().defaultTo('open');
    t.enum('priority', ['low', 'normal', 'high']).notNullable().defaultTo('normal');
    t.datetime('closed_at').nullable();
    t.datetime('created_at').notNullable().defaultTo(knex.fn.now());
    t.datetime('updated_at').notNullable().defaultTo(knex.fn.now());

    t.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
    t.index('user_id');
    t.index('status');
  });

  await knex.schema.createTable('ticket_messages', (t) => {
    t.bigint('id').unsigned().primary().autoIncrement();
    t.bigint('ticket_id').unsigned().notNullable();
    t.bigint('user_id').unsigned().notNullable(); // sender
    t.boolean('is_staff').notNullable().defaultTo(false);
    t.text('message').notNullable();
    t.datetime('created_at').notNullable().defaultTo(knex.fn.now());

    t.foreign('ticket_id').references('id').inTable('support_tickets').onDelete('CASCADE');
    t.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
    t.index('ticket_id');
  });

  // ── settings (site config key/value) ───────────────────
  await knex.schema.createTable('settings', (t) => {
    t.string('key', 100).primary();
    t.text('value').nullable();
    t.string('group', 60).nullable();
    t.datetime('updated_at').notNullable().defaultTo(knex.fn.now());
  });

  // ── activity_logs (audit) ──────────────────────────────
  await knex.schema.createTable('activity_logs', (t) => {
    t.bigint('id').unsigned().primary().autoIncrement();
    t.bigint('user_id').unsigned().nullable();
    t.string('action', 80).notNullable();
    t.string('entity_type', 60).nullable();
    t.bigint('entity_id').unsigned().nullable();
    t.json('meta').nullable();
    t.string('ip', 45).nullable();
    t.string('user_agent', 300).nullable();
    t.datetime('created_at').notNullable().defaultTo(knex.fn.now());

    t.index('user_id');
    t.index('action');
    t.index(['entity_type', 'entity_id']);
  });

  // Seed-only helper: keep a list of available tables for tests/debug.
  Object.assign(TABLES, {});
};

exports.down = async (knex) => {
  // Drop in reverse dependency order.
  const order = [
    'activity_logs',
    'settings',
    'ticket_messages',
    'support_tickets',
    'notifications',
    'wallet_transactions',
    'wallets',
    'transactions',
    'order_items',
    'orders',
    'coupons',
    'reviews',
    'product_faqs',
    'product_tags',
    'product_features',
    'product_images',
    'products',
    'categories',
    'user_addresses',
    'users',
  ];
  for (const table of order) {
    await knex.schema.dropTableIfExists(table);
  }
};
