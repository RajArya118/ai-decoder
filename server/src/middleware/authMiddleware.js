import jwt from 'jsonwebtoken';
import { getIsMongoConnected } from '../config/db.js';
import { User } from '../models/User.js';
import { LocalStore } from '../models/LocalStore.js';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_ai_decoder_jwt_token_key_2026';

async function resolveUserFromTokenOrApiKey(req) {
  const authHeader = req.headers.authorization;
  const apiKey = req.headers['x-api-key'];

  // Check Bearer Token
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      return decoded;
    } catch (err) {
      return null;
    }
  }

  // Check API Key
  if (apiKey) {
    const isMongo = getIsMongoConnected();
    if (isMongo) {
      const user = await User.findOne({ apiKey, isActive: true }).select('-password');
      if (user) {
        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          authType: 'api_key'
        };
      }
    } else {
      const user = await LocalStore.findUserByApiKey(apiKey);
      if (user && user.isActive) {
        return {
          id: user.id || user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          authType: 'api_key'
        };
      }
    }
  }

  return null;
}

export const optionalAuth = async (req, res, next) => {
  try {
    req.user = await resolveUserFromTokenOrApiKey(req);
  } catch (err) {
    req.user = null;
  }
  next();
};

export const requireAuth = async (req, res, next) => {
  try {
    const user = await resolveUserFromTokenOrApiKey(req);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Provide Bearer Token or X-API-Key header.'
      });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid authentication credentials' });
  }
};

export const requireRole = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Requires one of [${allowedRoles.join(', ')}] permissions.`
      });
    }
    next();
  };
};
