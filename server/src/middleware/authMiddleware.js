// TODO: test if the user is authenticated using JWT token
import jwt from 'jsonwebtoken';
import UserModel from '../models/UserModel.js';

const authMiddleware = async (req, res, next) => {
  try {
    // 1. Token extraction - more robust checking
    const token = req.cookies?.token;

    if (!token) {
      console.warn('Authentication attempt without token');
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // 2. Token verification with better error handling
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      console.error('JWT verification failed:', jwtError.message);
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
        error: jwtError.message
      });
    }

    // 3. User lookup - optimized query
    const user = await UserModel.findById(decoded.id)
      .select('-password') // Always exclude password
      .lean(); // Convert to plain object

    if (!user) {
      console.warn(`User not found for ID: ${decoded.id}`);
      return res.status(404).json({
        success: false,
        message: 'User account not found'
      });
    }

    // 4. Attach user to request
    req.user = user;
    console.log(`Authenticated user: ${user.email}`); // Debug
    next();

  } catch (error) {
    console.error('Authentication system error:', {
      error: error.message,
      stack: error.stack // For debugging
    });
    res.status(500).json({ 
      success: false,
      message: 'Authentication system error',
      error: error.message 
    });
  }
};

export default authMiddleware;