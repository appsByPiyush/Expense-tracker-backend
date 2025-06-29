const db = require('../config/db');

const CategoryModel = {
  getByUser: async (userId, filters = {}) => {
    let query = 'SELECT * FROM categories WHERE user_id = ?';
    const params = [userId];

    if (filters.type) {
      query += ' AND type = ?';
      params.push(filters.type);
    }
    const [rows] = await db.query(query, params);
    return rows;
  },

  create: async ({ user_id, name, type}) => {
    const [result] = await db.query(
      'INSERT INTO categories (user_id, name, type) VALUES (?, ?, ?)',
      [user_id, name, type]
    );
    return result.insertId;
  },

  update: async (id, userId, data) => {
    await db.query(
      'UPDATE categories SET name = ?, type = ? WHERE id = ? AND user_id = ?',
      [data.name, data.type, id, userId]
    );
  },

  delete: async (id, userId) => {
    await db.query('DELETE FROM categories WHERE id = ? AND user_id = ?', [id, userId]);
  }
};

module.exports = CategoryModel;