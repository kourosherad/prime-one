const BaseModel = require('./base');
const db = require('../config/db');

class AddressModel extends BaseModel {
  constructor() {
    super('user_addresses');
  }

  forUser(userId) {
    return db('user_addresses').where({ user_id: userId }).orderBy('is_default', 'desc').orderBy('id', 'desc');
  }

  async setDefault(userId, id) {
    return db.transaction(async (trx) => {
      await trx('user_addresses').where({ user_id: userId }).update({ is_default: false });
      await trx('user_addresses').where({ id, user_id: userId }).update({ is_default: true });
    });
  }
}

module.exports = new AddressModel();
module.exports.AddressModel = AddressModel;
