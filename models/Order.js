const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [
      {
        id: Number,
        name: String,
        price: Number,
        quantity: Number,
        image: String,
      },
    ],
    total: { type: Number, required: true },
    status: { type: String, default: 'pending' },
    deliveryAddress: {
      street: String,
      city: String,
      state: String,
      postcode: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
