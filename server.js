require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectMongoDb } = require('./config/mongodbConfig');
const authRoutes = require('./routers/authRoutes');
const menuRoutes = require('./routers/menuRoutes');
const authMiddleware = require('./middlewares/authMiddleware');

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Burger Yard API is running',
    endpoints: ['/api/v1/auth/signup', '/api/v1/auth/login', '/api/v1/menu'],
  });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/menu', menuRoutes);

app.post('/api/v1/checkout', authMiddleware, (req, res) => {
  const { items, total, deliveryAddress } = req.body;

  if (!Array.isArray(items) || !items.length) {
    return res.status(400).json({ success: false, message: 'Cart is empty' });
  }

  return res.status(201).json({
    success: true,
    message: 'Order placed successfully',
    order: {
      user: req.user,
      items,
      total,
      deliveryAddress,
      status: 'confirmed',
    },
  });
});

connectMongoDb();

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});