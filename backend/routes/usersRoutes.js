import express from 'express';
import { signUp, signIn, updateUser, getProfile, forgotPassword, resetPassword, getUserTickets, logout } from '../controllers/users.js';
import passport from '../config/passport.js';
import jwt from 'jsonwebtoken';
import { auth } from '../middleware/auth.js';
import upload from '../config/multer.js';
import cloudinary from '../config/cloudinary.js';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router()
    
router.post("/signup", signUp)
router.post("/signin", signIn)
router.get("/logout", auth, logout)
router.post("/forgot-password", forgotPassword)
router.post("/reset-password", resetPassword)
router.put("/update/:id", auth, upload.single('profileImage'), updateUser)
router.get("/profile", auth, getProfile)
router.get("/dashboard", auth, getUserTickets)
router.get("/dashboard", auth,getUserTickets)

// Google OAuth routes
router.get('/auth/google',
  passport.authenticate('google', { 
    scope: ['profile', 'email']
  })
);
router.get('/auth/google/callback',
  passport.authenticate('google', { 
    failureRedirect: `${process.env.FRONTEND_URL}/login`,
    failureMessage: true
  }),
  (req, res) => {
    try {
      // Create refresh token
      const refreshToken = jwt.sign(
        { 
          id: req.user._id,
          email: req.user.email,
          role: req.user.role
        },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '7d' }
      );

      // Set refresh token in cookie
      res.cookie('refreshtoken', refreshToken, {
        httpOnly: true,
        path: '/',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production'
      });

      // Redirect to frontend auth callback instead of profile
      res.redirect(`${process.env.FRONTEND_URL}/auth/callback`);
    } catch (error) {
      console.error('Auth callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL}/login?error=Authentication failed`);
    }
  }
);
// Route to handle failed Google auth
router.get('/auth/failed', (req, res) => {
  res.status(401).json({
    success: false,
    message: req.session.messages ? req.session.messages[0] : 'Authentication failed'
  });
});

export default router