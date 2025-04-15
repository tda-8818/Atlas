// TODO: test if the user is authenticated using JWT token
import jwt from 'jsonwebtoken';
import UserModel from '../models/UserModel.js'

const authMiddleware = async (req, res, next) => {
  try {

    // 1. Get token from cookies
   
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    // 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log('Looking up user:', decoded.id);
    // 3. Check user exists
    const user = await UserModel.findById(decoded.id).select('-password');

    if (!user) {
      console.log('❌ User not found for token');
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('✅ Authenticated user:', user.email);
    req.user = user;
    next();
    
    next();
  } catch (error) {
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

export default authMiddleware;