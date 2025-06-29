const db = require('../config/db');

const TransactionModel = {
  getByUser: async (userId, filters = {}) => {
    let query = 'SELECT * FROM transactions WHERE user_id = ?';
    const params = [userId];

    if (filters.type) {
      query += ' AND type = ?';
      params.push(filters.type);
    }
    if (filters.account_id) {
      query += ' AND account_id = ?';
      params.push(filters.account_id);
    }
    if (filters.from) {
      query += ' AND txn_datetime >= ?';
      params.push(filters.from);
    }
    if (filters.to) {
      query += ' AND txn_datetime <= ?';
      params.push(filters.to);
    }

    const [rows] = await db.query(query, params);
    return rows;
  },

  create: async ({ user_id, account_id, type, amount, txn_datetime, description, transfer_to = null }) => {
    const [result] = await db.query(
      'INSERT INTO transactions (user_id, account_id, type, amount, txn_datetime, description, transfer_to) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [user_id, account_id, type, amount, txn_datetime, description, transfer_to]
    );
    return result.insertId;
  },

  update: async (id, userId, data) => {
    await db.query(
      'UPDATE transactions SET account_id = ?, type = ?, amount = ?, txn_datetime = ?, description = ?, transfer_to = ? WHERE id = ? AND user_id = ?',
      [data.account_id, data.type, data.amount, data.txn_datetime, data.description, data.transfer_to || null, id, userId]
    );
  },

  delete: async (id, userId) => {
    await db.query('DELETE FROM transactions WHERE id = ? AND user_id = ?', [id, userId]);
  }
};

module.exports = TransactionModel;