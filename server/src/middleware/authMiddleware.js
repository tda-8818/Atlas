// TODO: test if the user is authenticated using JWT token
import jwt from 'jsonwebtoken';

const authMiddleware = async (req, res, next) => {
    try {
        // 1. Get token from cookies
        const token = req.cookies.token;

        if (!token) {
          return res.status(401).json({ message: 'Not authorized, no token' });
        }
    
        // 2. Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
        // 3. Check user exists
        req.user = await User.findById(decoded.id).select('-password');
        if (!req.user) {
          return res.status(401).json({message: 'User not found'});
        }
    
        next();
      } catch (error) {
        res.status(401).json({ message: 'Not authorized, token failed' });
      }
};

export default authMiddleware;