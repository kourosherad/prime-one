const BaseModel = require('./base');
const db = require('../config/db');

class TicketModel extends BaseModel {
  constructor() {
    super('support_tickets');
  }

  byUser(userId, { page = 1, pageSize = 10 } = {}) {
    return db('support_tickets')
      .where({ user_id: userId })
      .orderBy('updated_at', 'desc')
      .limit(pageSize)
      .offset((page - 1) * pageSize);
  }

  withMessages(id) {
    return db('support_tickets')
      .where({ id })
      .first()
      .then(async (ticket) => {
        if (!ticket) return null;
        const messages = await db('ticket_messages')
          .where({ ticket_id: id })
          .orderBy('created_at', 'asc');
        return { ...ticket, messages };
      });
  }
}

module.exports = new TicketModel();
module.exports.TicketModel = TicketModel;
