const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'bhasAjmee123';

const signJWT = (obj) =>
  jwt.sign(obj, JWT_SECRET, {
    expiresIn: '7d',
  });

const verifyJWT = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

module.exports = { signJWT, verifyJWT };