const admin = (req, res, next) => {
  const configuredAdminEmail = process.env.ADMIN_EMAIL?.toLowerCase();
  const isConfiguredAdmin = configuredAdminEmail && req.user.email === configuredAdminEmail;

  if (req.user.role !== 'admin' && !isConfiguredAdmin) {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }

  return next();
};

module.exports = admin;
