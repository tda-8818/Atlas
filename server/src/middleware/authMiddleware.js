// TODO: test if the user is authenticated using JWT token
import jwt from 'jsonwebtoken';
import UserModel from '../models/UserModel.js'

console.log('AuthMiddleware initialized');  // Should log on server start

const authMiddleware = async (req, res, next) => {
  try {

    console.log('Incoming cookies:', req.cookies);
    console.log('Headers:', req.headers.cookie);
    // 1. Get token from cookies
    console.log('🔑 Token verification started');
    const token = req.cookies.token;



    if (!token) {
      console.log('❌ No token provided');
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    // 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded:', decoded);  // 🚨 Log the decoded payload

    // 3. Check user exists
    const user = await UserModel.findById(decoded.id).select('-password');

    next();
  } catch (error) {
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

export default authMiddleware;