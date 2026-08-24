const express = require('express');
const { getUserByEmail, insertUser } = require('../models/user/UserModel');
const { comparePassword, hashPassword } = require('../utils/bcryptjs');
const { signJWT } = require('../utils/jwt');
const auth = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/signup', async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email and password are required',
      });
    }

    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User already exists',
      });
    }

    const newUser = await insertUser({
      name,
      email: email.toLowerCase(),
      password: hashPassword(password),
    });

    const token = signJWT({ email: newUser.email, id: newUser._id.toString(), name: newUser.name });

    return res.status(201).json({
      success: true,
      token,
      user: {
        id: newUser._id.toString(),
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    if (error.message && error.message.includes('E11000 duplicate key error collection')) {
      return res.status(409).json({
        success: false,
        message: 'There is another user using this email. Please login or use another email.',
      });
    }

    return next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const isMatched = comparePassword(password, user.password);
    if (!isMatched) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const token = signJWT({ email: user.email, id: user._id.toString(), name: user.name });

    user.password = undefined;

    return res.json({
      success: true,
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    return next(error);
  }
});

router.get('/me', auth, (req, res) => {
  const user = req.user;

  return res.json({
    success: true,
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
    },
  });
});

router.post('/checkout', auth, async (req, res) => {
  try {
    const { items, total, deliveryAddress } = req.body || {};

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order items are required',
      });
    }

    if (!deliveryAddress || !deliveryAddress.city || !deliveryAddress.street) {
      return res.status(400).json({
        success: false,
        message: 'Delivery address is required',
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order: {
        userId: req.user._id.toString(),
        items,
        total,
        deliveryAddress,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Unable to place order',
    });
  }
});

module.exports = router;
