const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI;

const conMongoDb = async () => {
  try {
    const conn = await mongoose.connect(MONGO_URI);
    if (conn) {
      console.log('MongoDB connected successfully');
    }
    return true;
  } catch (error) {
    console.log('MongoDB connection error:', error.message);
    return false;
  }
};

module.exports = { conMongoDb };