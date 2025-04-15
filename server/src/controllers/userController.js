import UserModel from '../models/UserModel.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const cookieOptions = {
  httpOnly: true,
  secure: false, // false for localhost development
  sameSite: 'lax', // or 'none' if cross-site
  domain: 'localhost', // Explicitly set domain
  path: '/', // Root path
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

// Login controller
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Find user
    const user = await UserModel.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const isCorrect = await bcrypt.compare(password, user.password);
    if (!isCorrect) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' } // Match cookie maxAge
    );
    console.log('Generated token:', token);

    // Set HTTP-only cookie
    res.cookie('token', token, cookieOptions);
    console.log('Cookie options set');

    // Return user data (without sensitive info)
    res.status(200).json({
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }
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
  res.clearCookie('token', cookieOptions);
  res.status(200).json({ message: 'Logged out successfully' });
};

// Get user controller
export const getMe = async (req, res) => {
  try {
    // Return minimal needed user data
    res.status(200).json({
      user: {
        id: req.user._id,
        email: req.user.email,
        firstName: req.user.firstName,
        lastName: req.user.lastName
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export default {
  login,
  signup,
  logout,
  getMe
};