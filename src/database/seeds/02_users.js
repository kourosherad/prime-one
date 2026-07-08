/**
 * Seed demo users: one super admin, one customer. Passwords are hashed with bcrypt.
 *  - admin@primeone.local   / Admin@123456
 *  - customer@primeone.local / Customer@123456
 */
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

exports.seed = async (knex) => {
  const salt = await bcrypt.genSalt(10);

  const users = [
    {
      uuid: uuidv4(),
      first_name: 'سوپر',
      last_name: 'ادمین',
      email: 'admin@primeone.local',
      phone: '09120000000',
      password_hash: await bcrypt.hash('Admin@123456', salt),
      role: 'super_admin',
      status: 'active',
      email_verified: true,
    },
    {
      uuid: uuidv4(),
      first_name: 'مشتری',
      last_name: 'نمونه',
      email: 'customer@primeone.local',
      phone: '09121111111',
      password_hash: await bcrypt.hash('Customer@123456', salt),
      role: 'customer',
      status: 'active',
      email_verified: true,
    },
  ];

  for (const u of users) {
    const existing = await knex('users').where({ email: u.email }).first();
    let userId;
    if (existing) {
      await knex('users').where({ id: existing.id }).update({
        password_hash: u.password_hash,
        role: u.role,
        status: u.status,
        email_verified: u.email_verified,
        first_name: u.first_name,
        last_name: u.last_name,
      });
      userId = existing.id;
    } else {
      [userId] = await knex('users').insert(u);
    }

    // ensure wallet exists
    const wallet = await knex('wallets').where({ user_id: userId }).first();
    if (!wallet) {
      await knex('wallets').insert({
        user_id: userId,
        balance: u.role === 'super_admin' ? 0 : 500000,
      });
    }
  }
};
