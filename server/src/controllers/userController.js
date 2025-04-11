import UserModel from '../models/UserModel.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

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

    // 1. Check if user exists
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        status: 'fail',
        message: 'Invalid email or password',
      });
    }

    // 2. Verify password (bcrypt still required!)
    const isCorrect = await bcrypt.compare(password, user.password);
    if (!isCorrect) {
      return res.status(401).json({
        status: 'fail',
        message: 'Invalid email or password',
      });
    }

    // 3. Generate token
    const token = generateToken(user._id);

    // 4. Set HTTP-only cookie
    res.cookie('token', token, cookieOptions);

    // 5. Send response
    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: user._id,
          name: user.name,
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
        const { name, email, password } = req.body;

    // 1. Hash password (still essential!)
    const hashedPassword = await bcrypt.hash(password, 12);

    // 2. Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // 3. Generate token
    const token = generateToken(user._id);

    // 4. Set HTTP-only cookie
    res.cookie('token', token, cookieOptions);

    // 5. Send response (without sensitive data)
    res.status(201).json({
      status: 'success',
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
            status: 'fail',
            message: error.message,
          });
    }
};

// Get user controller
export const getUser = async (req, res) => {
    try {
        const userId = req.user.userId; // Get userId from the decoded JWT
        const user = await UserModel.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

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
    getUser,
};