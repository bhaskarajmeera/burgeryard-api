const requiredInProduction = ['MONGO_URI', 'JWT_SECRET'];

const validateEnvironment = () => {
  if (process.env.NODE_ENV === 'production') {
    const missing = requiredInProduction.filter((name) => !process.env[name]);
    if (missing.length > 0) {
      throw new Error(`Missing required production environment variables: ${missing.join(', ')}`);
    }
  }

  return {
    port: Number(process.env.PORT || 8000),
    clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
    stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
    stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  };
};

module.exports = { validateEnvironment };
