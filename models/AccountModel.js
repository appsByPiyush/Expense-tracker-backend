const db = require('../config/db');

const AccountModel = {
  getByUser: async (userId) => {
    const [rows] = await db.query('SELECT * FROM accounts WHERE user_id = ?', [userId]);
    return rows;
  },

  create: async (userId, name, type, balance = 0.0) => {
    const [result] = await db.query(
      'INSERT INTO accounts (user_id, name, type, balance) VALUES (?, ?, ?, ?)',
      [userId, name, type, balance]
    );
    return result.insertId;
  },

  update: async (accountId, userId, name, type, balance) => {
    await db.query(
      'UPDATE accounts SET name = ?, type = ?, balance = ? WHERE id = ? AND user_id = ?',
      [name, type, balance, accountId, userId]
    );
  },

  delete: async (accountId, userId) => {
    await db.query('DELETE FROM accounts WHERE id = ? AND user_id = ?', [accountId, userId]);
  },

  updateBalance: async (accountId, userId, amount, isCredit = true) => {
    const operator = isCredit ? '+' : '-';
    await db.query(`UPDATE accounts SET balance = balance ${operator} ? WHERE id = ? AND user_id = ?`, [amount, accountId, userId]);
  }
};

module.exports = AccountModel;