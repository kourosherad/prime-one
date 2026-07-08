const BaseModel = require('./base');
const db = require('../config/db');

class WalletModel extends BaseModel {
  constructor() {
    super('wallets');
  }

  forUser(userId) {
    return db('wallets').where({ user_id: userId }).first();
  }

  async ensureForUser(userId) {
    let wallet = await db('wallets').where({ user_id: userId }).first();
    if (!wallet) {
      await db('wallets').insert({ user_id: userId, balance: 0 });
      wallet = await db('wallets').where({ user_id: userId }).first();
    }
    return wallet;
  }

  // Credit or debit within a transaction. Returns updated wallet row.
  async apply(walletId, direction, amount, reason, transactionId = null) {
    return db.transaction(async (trx) => {
      const wallet = await trx('wallets').where({ id: walletId }).forUpdate().first();
      if (!wallet) throw new Error('Wallet not found');
      const amt = Number(amount);
      let newBalance = Number(wallet.balance);
      if (direction === 'credit') newBalance += amt;
      else newBalance -= amt;
      if (newBalance < 0) throw new Error('Insufficient wallet balance');

      await trx('wallets').where({ id: walletId }).update({
        balance: newBalance,
        updated_at: db.fn.now(),
      });
      await trx('wallet_transactions').insert({
        wallet_id: walletId,
        direction,
        amount: amt,
        balance_after: newBalance,
        reason,
        transaction_id: transactionId,
      });
      return { ...wallet, balance: newBalance };
    });
  }

  transactions(walletId, { page = 1, pageSize = 15 } = {}) {
    return db('wallet_transactions')
      .where({ wallet_id: walletId })
      .orderBy('created_at', 'desc')
      .limit(pageSize)
      .offset((page - 1) * pageSize);
  }
}

module.exports = new WalletModel();
module.exports.WalletModel = WalletModel;
