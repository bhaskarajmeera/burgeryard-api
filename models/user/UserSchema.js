const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      index: 1,
      required: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: false,
    },
    authProvider: { type: String, enum: ['local', 'google'], default: 'local' },
    providerId: { type: String, index: true, sparse: true },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    phone: {
      type: String,
      trim: true,
    },
    deliveryAddress: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      postcode: { type: String, trim: true },
    },
    paymentCard: {
      cardholderName: { type: String, trim: true },
      brand: { type: String, trim: true },
      last4: { type: String, match: /^\d{4}$/ },
      expiryMonth: { type: String, match: /^(0[1-9]|1[0-2])$/ },
      expiryYear: { type: String, match: /^\d{4}$/ },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('User', userSchema);
