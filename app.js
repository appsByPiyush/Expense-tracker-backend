const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const accountRoutes = require('./routes/accounts');
const transactionRoutes = require('./routes/transactions');
const categoryRoutes = require('./routes/categories');
const verifyToken = require('./middleware/authMiddleware');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello from Node.js');
});
// Public Routes
app.use('/api/auth', authRoutes);

// Protected Routes
app.use('/api/accounts', verifyToken, accountRoutes);
app.use('/api/category', verifyToken, categoryRoutes);
app.use('/api/transactions', verifyToken, transactionRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Server running on http://localhost:${process.env.PORT}`);
});
