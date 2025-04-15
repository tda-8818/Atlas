import UserModel from '../models/UserModel.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import mongoose from 'mongoose';


// Add this temporary route for testing
export const testUser = async (req, res) => {
  try {
    const count = await User.countDocuments({});
    res.json({ 
      success: true,
      userCount: count 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Cookie configuration (reusable across routes)
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', // HTTPS in production
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// Helper function to generate token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  });
};

// Login controller
export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const { email, password } = req.body;

    // Add validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // 1. Check if user exists
    const user = await UserModel.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // 2. Verify password 
    const isCorrect = await bcrypt.compare(password, user.password);
    if (!isCorrect) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // 3. Generate token
    const token = generateToken(user._id);

    // 4. Set HTTP-only cookie
    res.cookie('token', token, cookieOptions);

    // 5. Send response
    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// Signup controller
export const signup = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // 1. check if user exists
    const existingUser = await UserModel.findOne({email});
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists.'
      })
    }

    // 2. hash password 
    const hashedPassword = await bcrypt.hash(password, 12);

    // 3. create user
    const user = await UserModel.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });

    // 4. Generate token
    const token = generateToken(user._id);

    // 5. set http-only cookie
    res.cookie('token', token, cookieOptions);

    // 6. send response (excluding password)
    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      },
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Logout Controller
export const logout = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

// Get user controller
export const getMe = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      user: req.user // user already attached to req by authmiddleware
    });

    const userData = {
      fullName: `${user.firstName} ${user.lastName}`,
    };

    res.json(userData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export default {
  login,
  signup,
  logout,
  getMe,
  testUser
};