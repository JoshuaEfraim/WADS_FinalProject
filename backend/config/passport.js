import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/user.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/api/user/auth/google/callback',

    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists
        const email = profile.emails[0].value.toLowerCase();
        let user = await User.findOne({ email });

        if (user) {
          // If user exists, check if they registered through Google
          if (user.loginWithGoogle) {
            // User exists and used Google auth before - proceed with login
            return done(null, user);
          } else {
            // User exists but registered through regular signup
            return done(null, false, { 
              message: 'This email is already registered. Please login with your password.' 
            });
          }
        } else {
          // Create new user with Google auth
          user = await User.create({
            name: profile.displayName,
            email: email,
            password: 'google-oauth-' + Math.random().toString(36).slice(-8), // random password for security
            loginWithGoogle: true,
            profileImg: profile.photos[0].value,
            role: 'USER' // default role for all new registrations
          });
          return done(null, user);
        }
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  // Store only the user id in the session
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    // Retrieve user from database using id stored in session
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;