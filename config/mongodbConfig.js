const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI;

const conMongoDb = async () => {
  if (!MONGO_URI) {
    throw new Error('MONGO_URI is not configured');
  }

  try {
    const conn = await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    if (conn) {
      console.log('MongoDB connected successfully');
    }
    return true;
  } catch (error) {
    throw new Error(`MongoDB connection error: ${error.message}`);
  }
};

module.exports = { conMongoDb };