const db = require('../config/db');

// Get all accounts for a user
exports.getAccounts = async (req, res) => {
  try {
    const [accounts] = await db.query(
      'SELECT * FROM accounts WHERE user_id = ? and deleted_at IS NULL',
      [req.user.id]
    );
    res.json(accounts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch accounts' });
  }
};

// Create a new account
exports.createAccount = async (req, res) => {
  const { name, type, balance } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO accounts (user_id, name, type, balance) VALUES (?, ?, ?, ?)',
      [req.user.id, name, type, balance || 0.0]
    );
    res.status(201).json({ id: result.insertId, name, type, balance });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create account' });
  }
};

// Update an account
exports.updateAccount = async (req, res) => {
  const { name, type, balance } = req.body;
  try {
    await db.query(
      'UPDATE accounts SET name = ?, type = ?, balance = ? WHERE id = ? AND user_id = ?',
      [name, type, balance, req.params.id, req.user.id]
    );
    res.json({ message: 'Account updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update account' });
  }
};

// Delete an account
exports.deleteAccount = async (req, res) => {
  try {
    await db.query(
      'UPDATE accounts SET deleted_at = now() WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    res.json({ message: 'Account deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete account' });
  }
};
