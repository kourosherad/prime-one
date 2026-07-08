const BaseModel = require('./base');
const db = require('../config/db');

class NotificationModel extends BaseModel {
  constructor() {
    super('notifications');
  }

  forUser(userId, { unreadOnly = false, page = 1, pageSize = 20 } = {}) {
    const offset = (page - 1) * pageSize;
    let q = db('notifications').where({ user_id: userId });
    if (unreadOnly) q = q.andWhere('is_read', false);
    return q.orderBy('created_at', 'desc').limit(pageSize).offset(offset);
  }

  unreadCount(userId) {
    return db('notifications')
      .where({ user_id: userId, is_read: false })
      .count({ count: '*' })
      .first();
  }

  send(userId, { type, title, body, link }) {
    return db('notifications').insert({ user_id: userId, type, title, body, link });
  }

  markRead(id) {
    return db('notifications').where({ id }).update({ is_read: true });
  }

  markAllRead(userId) {
    return db('notifications').where({ user_id: userId }).update({ is_read: true });
  }
}

module.exports = new NotificationModel();
module.exports.NotificationModel = NotificationModel;
