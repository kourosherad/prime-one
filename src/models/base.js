/**
 * Base model: thin query helpers over a single table.
 * Specific models extend this to add domain methods.
 */
const db = require('../config/db');

class BaseModel {
  constructor(table) {
    this.table = table;
    this.db = db;
  }

  query() {
    return db(this.table);
  }

  findById(id) {
    return db(this.table).where({ id }).first();
  }

  findOne(where) {
    return db(this.table).where(where).first();
  }

  find(where, { orderBy } = {}) {
    let q = db(this.table).where(where);
    if (orderBy) q = q.orderBy(orderBy);
    return q;
  }

  all({ orderBy } = {}) {
    let q = db(this.table);
    if (orderBy) q = q.orderBy(orderBy);
    return q;
  }

  count(where = {}) {
    return db(this.table).where(where).count({ count: '*' }).first().then((r) => r?.count || 0);
  }

  create(data) {
    return db(this.table).insert(data).then((ids) => ({ id: ids[0], ...data }));
  }

  createMany(rows) {
    return db(this.table).insert(rows);
  }

  update(id, data) {
    return db(this.table).where({ id }).update({ ...data, updated_at: db.fn.now() });
  }

  updateWhere(where, data) {
    return db(this.table).where(where).update({ ...data, updated_at: db.fn.now() });
  }

  delete(id) {
    return db(this.table).where({ id }).delete();
  }

  deleteWhere(where) {
    return db(this.table).where(where).delete();
  }
}

module.exports = BaseModel;
