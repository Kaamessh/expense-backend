const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('./models/User');

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: `${BACKEND_URL}/api/v1/auth/google/callback`
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails && profile.emails[0] && profile.emails[0].value;
    const avatar = profile.photos && profile.photos[0] && profile.photos[0].value;
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        email,
        name: profile.displayName || null,
        googleId: profile.id,
        avatar: avatar || null
      });
    } else {
      user.googleId = user.googleId || profile.id;
      user.avatar = user.avatar || avatar || null;
      await user.save();
    }
    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));
