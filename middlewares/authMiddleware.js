const { getUserByEmail } = require('../models/user/UserModel');
const { verifyJWT } = require('../utils/jwt');

const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Access token missing' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyJWT(token);

    if (!decoded?.email) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const user = await getUserByEmail(decoded.email);

    if (!user?._id) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    user.password = undefined;
    req.user = user;

    next();
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = auth;
