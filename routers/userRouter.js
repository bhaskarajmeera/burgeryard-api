const express = require('express');
const { getUserByEmail, insertUser, updateUserDetails } = require('../models/user/UserModel');
const { comparePassword, hashPassword } = require('../utils/bcryptjs');
const { signJWT } = require('../utils/jwt');
const auth = require('../middlewares/authMiddleware');
const { getOrdersByUserId, insertOrder } = require('../models/order/OrderModel');

const router = express.Router();

const serializeUser = (user) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  phone: user.phone || '',
  deliveryAddress: user.deliveryAddress || {},
});

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
      user: serializeUser(newUser),
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
      user: serializeUser(user),
    });
  } catch (error) {
    return next(error);
  }
});

router.get('/me', auth, (req, res) => {
  const user = req.user;

  return res.json({
    success: true,
    user: serializeUser(user),
  });
});

router.get('/orders', auth, async (req, res) => {
  try {
    const orders = await getOrdersByUserId(req.user._id);

    return res.json({
      success: true,
      orders,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Unable to load orders',
    });
  }
});

router.post('/checkout', auth, async (req, res) => {
  try {
    const { items, total, deliveryAddress, paymentMethod } = req.body || {};

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order items are required',
      });
    }

    if (
      !deliveryAddress ||
      !deliveryAddress.city ||
      !deliveryAddress.street ||
      !deliveryAddress.state ||
      !deliveryAddress.postcode ||
      !deliveryAddress.phone
    ) {
      return res.status(400).json({
        success: false,
        message: 'Delivery address is required',
      });
    }

    if (!['cash', 'card'].includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: 'A valid payment method is required',
      });
    }

    if (typeof total !== 'number' || total < 0) {
      return res.status(400).json({
        success: false,
        message: 'A valid order total is required',
      });
    }

    const order = await insertOrder({
      userId: req.user._id,
      items,
      total,
      deliveryAddress,
      paymentMethod,
    });

    const updatedUser = await updateUserDetails(req.user._id, {
      phone: deliveryAddress.phone,
      deliveryAddress: {
        street: deliveryAddress.street,
        city: deliveryAddress.city,
        state: deliveryAddress.state,
        postcode: deliveryAddress.postcode,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order,
      user: serializeUser(updatedUser),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Unable to place order',
    });
  }
});

module.exports = router;
