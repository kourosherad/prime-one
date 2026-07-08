const BaseModel = require('./base');
const db = require('../config/db');

class ActivityLogModel extends BaseModel {
  constructor() {
    super('activity_logs');
  }

  log({ userId = null, action, entityType = null, entityId = null, meta = null, ip = null, userAgent = null }) {
    return db('activity_logs').insert({
      user_id: userId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      meta: meta ? JSON.stringify(meta) : null,
      ip,
      user_agent: userAgent,
    });
  }

  recent(limit = 50) {
    return db('activity_logs')
      .leftJoin('users', 'users.id', 'activity_logs.user_id')
      .select(
        'activity_logs.*',
        'users.first_name',
        'users.last_name',
        'users.email'
      )
      .orderBy('activity_logs.created_at', 'desc')
      .limit(limit);
  }
}

module.exports = new ActivityLogModel();
module.exports.ActivityLogModel = ActivityLogModel;
