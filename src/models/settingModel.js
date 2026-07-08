const BaseModel = require('./base');
const db = require('../config/db');

class SettingModel extends BaseModel {
  constructor() {
    super('settings');
  }

  async allAsObject() {
    const rows = await db('settings');
    const obj = {};
    rows.forEach((r) => (obj[r.key] = r.value));
    return obj;
  }

  get(key, fallback = null) {
    return db('settings').where({ key }).first().then((r) => (r ? r.value : fallback));
  }

  set(key, value, group = null) {
    return db('settings')
      .insert({ key, value, group, updated_at: db.fn.now() })
      .onConflict('key')
      .merge();
  }

  setMany(items) {
    return db.transaction(async (trx) => {
      for (const { key, value, group } of items) {
        await trx('settings')
          .insert({ key, value, group, updated_at: db.fn.now() })
          .onConflict('key')
          .merge();
      }
    });
  }
}

module.exports = new SettingModel();
module.exports.SettingModel = SettingModel;
