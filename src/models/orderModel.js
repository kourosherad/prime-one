const BaseModel = require('./base');
const db = require('../config/db');

class OrderModel extends BaseModel {
  constructor() {
    super('orders');
  }

  withItems(id) {
    return db('orders')
      .where({ 'orders.id': id })
      .first()
      .then(async (order) => {
        if (!order) return null;
        const items = await db('order_items').where({ order_id: id });
        return { ...order, items };
      });
  }

  byUser(userId, { page = 1, pageSize = 10 } = {}) {
    const offset = (page - 1) * pageSize;
    return db('orders')
      .where({ user_id: userId })
      .orderBy('created_at', 'desc')
      .limit(pageSize)
      .offset(offset);
  }

  countByUser(userId) {
    return db('orders').where({ user_id: userId }).count({ count: '*' }).first();
  }

  byNumber(orderNumber) {
    return db('orders').where({ order_number: orderNumber }).first();
  }

  // Recent orders for admin dashboard.
  recent(limit = 8) {
    return db('orders')
      .join('users', 'users.id', 'orders.user_id')
      .select(
        'orders.id',
        'orders.order_number',
        'orders.status',
        'orders.total',
        'orders.created_at',
        'users.first_name',
        'users.last_name',
        'users.email'
      )
      .orderBy('orders.created_at', 'desc')
      .limit(limit);
  }
}

module.exports = new OrderModel();
module.exports.OrderModel = OrderModel;
