const express = require('express');
const { getUserByEmail, insertUser, updateUserDetails } = require('../models/user/UserModel');
const { comparePassword, hashPassword } = require('../utils/bcryptjs');
const { signJWT } = require('../utils/jwt');
const auth = require('../middlewares/authMiddleware');
const { getOrdersByUserId, insertOrder } = require('../models/order/OrderModel');

const stripe = process.env.STRIPE_SECRET_KEY ? require('stripe')(process.env.STRIPE_SECRET_KEY) : null;

const router = express.Router();

const serializeUser = (user) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  phone: user.phone || '',
  deliveryAddress: user.deliveryAddress || {},
  paymentCard: user.paymentCard || {},
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

router.put('/profile', auth, async (req, res) => {
  try {
    const { phone, deliveryAddress, paymentCard } = req.body || {};
    const card = paymentCard || {};
    const hasCardDetails = Object.values(card).some(Boolean);
    const hasAddressDetails = deliveryAddress && Object.values(deliveryAddress).some(Boolean);

    if (hasAddressDetails && (!deliveryAddress.street || !deliveryAddress.city || !deliveryAddress.state || !deliveryAddress.postcode)) {
      return res.status(400).json({
        success: false,
        message: 'Complete delivery address is required',
      });
    }

    if (
      hasCardDetails &&
      (!/^\d{4}$/.test(card.last4 || '') || !card.cardholderName || !card.brand || !/^(0[1-9]|1[0-2])$/.test(card.expiryMonth || '') || !/^\d{4}$/.test(card.expiryYear || ''))
    ) {
      return res.status(400).json({
        success: false,
        message: 'Complete card details are required',
      });
    }

    const profileUpdates = {};

    if (phone) {
      profileUpdates.phone = phone;
    }

    if (hasAddressDetails) {
      profileUpdates.deliveryAddress = deliveryAddress;
    }

    if (hasCardDetails) {
      profileUpdates.paymentCard = {
        cardholderName: card.cardholderName,
        brand: card.brand,
        last4: card.last4,
        expiryMonth: card.expiryMonth,
        expiryYear: card.expiryYear,
      };
    }

    const updatedUser = await updateUserDetails(req.user._id, profileUpdates);

    return res.json({
      success: true,
      user: serializeUser(updatedUser),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Unable to update profile',
    });
  }
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

router.post('/payments/create-intent', auth, async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({
        success: false,
        message: 'Stripe is not configured on the server',
      });
    }

    const { amount } = req.body || {};
    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'A valid payment amount is required',
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
      metadata: { userId: req.user._id.toString() },
    });

    return res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Unable to initialize payment',
    });
  }
});

router.post('/checkout', auth, async (req, res) => {
  try {
    const { items, total, deliveryAddress, paymentMethod, paymentIntentId } = req.body || {};

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

    if (!['cash', 'stripe'].includes(paymentMethod)) {
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

    if (paymentMethod === 'stripe') {
      if (!stripe || !paymentIntentId) {
        return res.status(400).json({
          success: false,
          message: 'A completed Stripe payment is required',
        });
      }

      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      if (
        paymentIntent.status !== 'succeeded' ||
        paymentIntent.metadata.userId !== req.user._id.toString() ||
        paymentIntent.amount !== Math.round(total * 100)
      ) {
        return res.status(400).json({
          success: false,
          message: 'Stripe payment could not be verified',
        });
      }
    }

    const order = await insertOrder({
      userId: req.user._id,
      items,
      total,
      deliveryAddress,
      paymentMethod,
      paymentIntentId: paymentMethod === 'stripe' ? paymentIntentId : undefined,
      paymentStatus: paymentMethod === 'stripe' ? 'paid' : 'pending',
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
