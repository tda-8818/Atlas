import jwt from 'jsonwebtoken';
import UserModel from '../models/UserModel.js';
import ApiKey from '../models/ApiKeyModel.js';
import { hashApiKey, isApiKeyFormat } from '../utils/apiKeyUtils.js';

const getBearerToken = (req) => {
  const header = req.headers.authorization || req.headers.Authorization;
  if (!header || typeof header !== 'string') return null;
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) return null;
  return token.trim();
};

const attachUser = async (userId) => {
  return UserModel.findById(userId).select('-password').lean();
};

const authenticateWithApiKey = async (rawKey) => {
  const hashedKey = hashApiKey(rawKey);
  const apiKey = await ApiKey.findOne({ hashedKey });
  if (!apiKey) return null;

  const user = await attachUser(apiKey.userId);
  if (!user) return null;

  apiKey.lastUsedAt = new Date();
  apiKey.save().catch((err) => {
    console.error('Failed to update API key lastUsedAt:', err.message);
  });

  return user;
};

const authenticateWithJwt = async (token) => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (!decoded?.id) return null;
  return attachUser(decoded.id);
};

const authMiddleware = async (req, res, next) => {
  try {
    const bearer = getBearerToken(req);
    const cookieToken = req.cookies?.token;
    let user = null;

    if (bearer && isApiKeyFormat(bearer)) {
      user = await authenticateWithApiKey(bearer);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid API key',
        });
      }
      req.authMethod = 'apiKey';
    } else {
      const jwtToken = bearer || cookieToken;
      if (!jwtToken) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      try {
        user = await authenticateWithJwt(jwtToken);
      } catch (jwtError) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired token',
          error: jwtError.message,
        });
      }

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User account not found',
        });
      }
      req.authMethod = bearer ? 'bearerJwt' : 'cookie';
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication system error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Authentication system error',
      error: error.message,
    });
  }
};

export default authMiddleware;
