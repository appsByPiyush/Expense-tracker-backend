// File: controllers/transactionController.js
const db = require('../config/db');

// Get all transactions for a user (optional filters)
exports.getTransactions = async (req, res) => {
  try {
    const { type, account_id, from, to } = req.query;
    let query = 'SELECT * FROM transactions WHERE user_id = ? and deleted_at IS NULL';
    const params = [req.user.id];

    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }
    if (account_id) {
      query += ' AND account_id = ?';
      params.push(account_id);
    }
    if (from) {
      query += ' AND txn_datetime >= ?';
      params.push(from);
    }
    if (to) {
      query += ' AND txn_datetime <= ?';
      params.push(to);
    }

    const [transactions] = await db.query(query, params);
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
};

// Create a new transaction
exports.createTransaction = async (req, res) => {
  const { account_id, type, amount, txn_datetime, description, transfer_to } = req.body;
  const userId = req.user.id;
  try {
    const [result] = await db.query(
      'INSERT INTO transactions (user_id, account_id, type, amount, txn_datetime, description, transfer_to) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userId, account_id, type, amount, txn_datetime, description, transfer_to || null]
    );

    // Handle balance updates if needed (basic logic)
    if (type === 'credit') {
      await db.query('UPDATE accounts SET balance = balance + ? WHERE id = ? AND user_id = ?', [amount, account_id, userId]);
    } else if (type === 'debit') {
      await db.query('UPDATE accounts SET balance = balance - ? WHERE id = ? AND user_id = ?', [amount, account_id, userId]);
    } else if (type === 'transfer') {
      await db.query('UPDATE accounts SET balance = balance - ? WHERE id = ? AND user_id = ?', [amount, account_id, userId]);
      await db.query('UPDATE accounts SET balance = balance + ? WHERE id = ? AND user_id = ?', [amount, transfer_to, userId]);
    }

    res.status(201).json({ id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create transaction', details: err.message });
  }
};

// Update transaction (basic version)
exports.updateTransaction = async (req, res) => {
  const { account_id, type, amount, txn_datetime, description, transfer_to } = req.body;
  try {
    await db.query(
      'UPDATE transactions SET account_id = ?, type = ?, amount = ?, txn_datetime = ?, description = ?, transfer_to = ? WHERE id = ? AND user_id = ?',
      [account_id, type, amount, txn_datetime, description, transfer_to || null, req.params.id, req.user.id]
    );
    res.json({ message: 'Transaction updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update transaction' });
  }
};

// Delete transaction
exports.deleteTransaction = async (req, res) => {
  try {
    const userId = req.user.id;
    const txnId = req.params.id;

    // Fetch the transaction first
    const [rows] = await db.query('SELECT * FROM transactions WHERE id = ? AND user_id = ?', [txnId, userId]);
    const txn = rows[0];
    if (!txn) return res.status(404).json({ error: 'Transaction not found' });

    // Rollback balance
    if (txn.type === 'credit') {
      await db.query('UPDATE accounts SET balance = balance - ? WHERE id = ? AND user_id = ?', [txn.amount, txn.account_id, userId]);
    } else if (txn.type === 'debit') {
      await db.query('UPDATE accounts SET balance = balance + ? WHERE id = ? AND user_id = ?', [txn.amount, txn.account_id, userId]);
    } else if (txn.type === 'transfer') {
      await db.query('UPDATE accounts SET balance = balance + ? WHERE id = ? AND user_id = ?', [txn.amount, txn.account_id, userId]);
      await db.query('UPDATE accounts SET balance = balance - ? WHERE id = ? AND user_id = ?', [txn.amount, txn.transfer_to, userId]);
    }

    // Delete the transaction
    await db.query('UPDATE transactions SET deleted_at = now() WHERE id = ? AND user_id = ?', [txnId, userId]);
    res.json({ message: 'Transaction deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete transaction' });
  }
};
