require('dotenv').config();
const express = require('express');
const cors = require('cors');
const passport = require('passport');
const { conMongoDb } = require('./config/mongodbConfig');
const { validateEnvironment } = require('./config/env');
const userRouter = require('./routers/userRouter');
const oauthRouter = require('./routers/oauthRouter');
const { updatePaymentStatusByIntent } = require('./models/order/OrderModel');

const environment = validateEnvironment();
const app = express();
const PORT = environment.port;
const stripe = environment.stripeSecretKey ? require('stripe')(environment.stripeSecretKey) : null;

// Allow the configured client to call the API and initialize Passport for OAuth.
app.use(cors({ origin: environment.clientUrl }));
app.use(passport.initialize());

// Stripe sends raw request data here so its signature can be verified safely.
app.post('/api/v1/webhooks/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  if (!stripe || !environment.stripeWebhookSecret) {
    return res.status(503).json({ success: false, message: 'Stripe webhook is not configured' });
  }

  let event;
  try {
    const signature = req.headers['stripe-signature'];
    event = stripe.webhooks.constructEvent(req.body, signature, environment.stripeWebhookSecret);
  } catch (error) {
    return res.status(400).json({ success: false, message: `Webhook signature verification failed: ${error.message}` });
  }

  try {
    if (event.type === 'payment_intent.succeeded') {
      await updatePaymentStatusByIntent(event.data.object.id, 'paid');
    }

    if (event.type === 'payment_intent.payment_failed') {
      await updatePaymentStatusByIntent(event.data.object.id, 'failed');
    }

    if (event.type === 'charge.refunded' && event.data.object.payment_intent) {
      await updatePaymentStatusByIntent(event.data.object.payment_intent, 'refunded');
    }

    return res.json({ received: true });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Unable to process webhook' });
  }
});

// Parse JSON for all regular API requests after the webhook route.
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Burger Yard API is running',
    endpoints: ['/api/v1/signup', '/api/v1/login', '/api/v1/me', '/api/v1/checkout'],
  });
});

// Mount customer, checkout, menu, and OAuth endpoints under the API version.
app.use('/api/v1', userRouter);
app.use('/api/v1/auth', oauthRouter);

// Connect before accepting requests so database failures are visible at startup.
const startServer = async () => {
  try {
    await conMongoDb();
    app.listen(PORT, (error) => {
      if (error) {
        console.log(error);
        return;
      }

      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
};

startServer();