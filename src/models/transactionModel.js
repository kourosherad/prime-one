const BaseModel = require('./base');
const db = require('../config/db');

class TransactionModel extends BaseModel {
  constructor() {
    super('transactions');
  }

  byTracking(code) {
    return db('transactions').where({ tracking_code: code }).first();
  }

  byAuthority(authority) {
    return db('transactions').where({ authority }).first();
  }

  byOrder(orderId) {
    return db('transactions').where({ order_id: orderId }).orderBy('created_at', 'desc');
  }

  byUser(userId, { page = 1, pageSize = 10 } = {}) {
    return db('transactions')
      .where({ user_id: userId })
      .orderBy('created_at', 'desc')
      .limit(pageSize)
      .offset((page - 1) * pageSize);
  }

  markPaid(id, { referenceId, gatewayResponse }) {
    return db('transactions').where({ id }).update({
      status: 'paid',
      reference_id: referenceId,
      gateway_response: gatewayResponse ? JSON.stringify(gatewayResponse) : null,
      paid_at: db.fn.now(),
      updated_at: db.fn.now(),
    });
  }

  markFailed(id, { gatewayResponse }) {
    return db('transactions').where({ id }).update({
      status: 'failed',
      gateway_response: gatewayResponse ? JSON.stringify(gatewayResponse) : null,
      updated_at: db.fn.now(),
    });
  }
}

module.exports = new TransactionModel();
module.exports.TransactionModel = TransactionModel;
