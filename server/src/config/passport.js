import './loadEnv.js';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import UserModel from '../models/UserModel.js';

// Google OAuth Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || 'dummy-client-id',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'dummy-client-secret',
    callbackURL: `${process.env.SERVER_URL || 'http://localhost:5001'}/api/users/auth/google/callback`
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user already exists with this Google ID
      let user = await UserModel.findOne({ providerId: profile.id, provider: 'google' });

      if (user) {
        return done(null, user);
      }

      // Check if user exists with same email but different provider
      const existingUser = await UserModel.findOne({ email: profile.emails[0].value });

      if (existingUser) {
        // Link Google account to existing user
        existingUser.provider = 'google';
        existingUser.providerId = profile.id;
        existingUser.emailVerified = true; // OAuth emails are verified
        await existingUser.save();
        return done(null, existingUser);
      }

      // Create new user
      const newUser = new UserModel({
        firstName: profile.name.givenName,
        lastName: profile.name.familyName,
        email: profile.emails[0].value,
        provider: 'google',
        providerId: profile.id,
        emailVerified: true,
        profilePic: profile.photos[0].value
      });

      await newUser.save();
      return done(null, newUser);
    } catch (error) {
      return done(error, null);
    }
  }
));

// GitHub OAuth Strategy
passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID || 'dummy-client-id',
    clientSecret: process.env.GITHUB_CLIENT_SECRET || 'dummy-client-secret',
    callbackURL: `${process.env.SERVER_URL || 'http://localhost:5001'}/api/users/auth/github/callback`
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user already exists with this GitHub ID
      let user = await UserModel.findOne({ providerId: profile.id, provider: 'github' });

      if (user) {
        return done(null, user);
      }

      // Check if user exists with same email but different provider
      const existingUser = await UserModel.findOne({ email: profile.emails[0].value });

      if (existingUser) {
        // Link GitHub account to existing user
        existingUser.provider = 'github';
        existingUser.providerId = profile.id;
        existingUser.emailVerified = true; // OAuth emails are verified
        await existingUser.save();
        return done(null, existingUser);
      }

      // Create new user
      const newUser = new UserModel({
        firstName: profile.displayName.split(' ')[0] || profile.username,
        lastName: profile.displayName.split(' ').slice(1).join(' ') || '',
        email: profile.emails[0].value,
        provider: 'github',
        providerId: profile.id,
        emailVerified: true,
        profilePic: profile.photos[0].value
      });

      await newUser.save();
      return done(null, newUser);
    } catch (error) {
      return done(error, null);
    }
  }
));

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user._id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await UserModel.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
