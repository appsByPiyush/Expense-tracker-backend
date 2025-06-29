const db = require('../config/db');

// Get all accounts for a user
exports.getCategory = async (req, res) => {
  try {
    const [accounts] = await db.query(
      'SELECT * FROM categories WHERE user_id = ? and deleted_at IS NULL',
      [req.user.id]
    );
    res.json(accounts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch category' });
  }
};

// Create a new account
exports.createCategory = async (req, res) => {
  const { name, type } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO categories (user_id, name, type) VALUES (?, ?, ?)',
      [req.user.id, name, type]
    );
    res.status(201).json({ id: result.insertId, name, type });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create category', details: err.message });
  }
};

// Update an account
exports.updateCategory = async (req, res) => {
  const { name, type, balance } = req.body;
  try {
    await db.query(
      'UPDATE categories SET name = ?, type = ?, balance = ? WHERE id = ? AND user_id = ?',
      [name, type, balance, req.params.id, req.user.id]
    );
    res.json({ message: 'Category updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update Category' });
  }
};

// Delete an account
exports.deleteCategory = async (req, res) => {
  try {
    await db.query(
      'UPDATE categories SET deleted_at = now() WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    res.json({ message: 'Category deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete Category' });
  }
};
