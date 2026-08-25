const express = require('express');
const fs = require('fs');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const AppleStrategy = require('passport-apple').Strategy;
const { createOAuthUser } = require('../models/user/UserModel');
const { signJWT } = require('../utils/jwt');

const router = express.Router();
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

const serializeOAuthUser = (user) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  role: user.role === 'admin' || process.env.ADMIN_EMAIL?.toLowerCase() === user.email ? 'admin' : 'user',
  phone: user.phone || '',
  deliveryAddress: user.deliveryAddress || {},
  paymentCard: user.paymentCard || {},
});

const completeLogin = (req, res) => {
  const token = signJWT({ email: req.user.email, id: req.user._id.toString(), name: req.user.name });
  const user = encodeURIComponent(JSON.stringify(serializeOAuthUser(req.user)));
  return res.redirect(`${clientUrl}/oauth-callback?token=${encodeURIComponent(token)}&user=${user}`);
};

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
  }, async (_accessToken, _refreshToken, profile, done) => {
    try {
      done(null, await createOAuthUser({
        provider: 'google',
        providerId: profile.id,
        email: profile.emails?.[0]?.value,
        name: profile.displayName || 'Google User',
      }));
    } catch (error) { done(error); }
  }));
}

if (process.env.APPLE_CLIENT_ID && process.env.APPLE_TEAM_ID && process.env.APPLE_KEY_ID && process.env.APPLE_PRIVATE_KEY_PATH) {
  passport.use(new AppleStrategy({
    clientID: process.env.APPLE_CLIENT_ID,
    teamID: process.env.APPLE_TEAM_ID,
    keyID: process.env.APPLE_KEY_ID,
    privateKeyString: fs.readFileSync(process.env.APPLE_PRIVATE_KEY_PATH, 'utf8'),
    callbackURL: process.env.APPLE_CALLBACK_URL,
  }, async (_accessToken, _refreshToken, idToken, profile, done) => {
    try {
      done(null, await createOAuthUser({
        provider: 'apple',
        providerId: idToken.sub,
        email: idToken.email,
        name: profile?.name ? `${profile.name.firstName || ''} ${profile.name.lastName || ''}`.trim() : 'Apple User',
      }));
    } catch (error) { done(error); }
  }));
}

router.get('/google', (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) return res.status(503).json({ success: false, message: 'Google OAuth is not configured' });
  return passport.authenticate('google', { scope: ['profile', 'email'], session: false })(req, res, next);
});
router.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: `${clientUrl}/signin?oauth=failed` }), completeLogin);
router.get('/apple', (req, res, next) => {
  if (!process.env.APPLE_CLIENT_ID) return res.status(503).json({ success: false, message: 'Apple OAuth is not configured' });
  return passport.authenticate('apple', { scope: ['name', 'email'], session: false })(req, res, next);
});
router.post('/apple/callback', passport.authenticate('apple', { session: false, failureRedirect: `${clientUrl}/signin?oauth=failed` }), completeLogin);

module.exports = router;
