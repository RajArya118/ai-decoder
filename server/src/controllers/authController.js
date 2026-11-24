import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getIsMongoConnected } from '../config/db.js';
import { User } from '../models/MongooseModels.js';
import { LocalStore } from '../models/LocalStore.js';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_ai_decoder_jwt_token_key_2026';

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const isMongo = getIsMongoConnected();
    const existing = isMongo
      ? await User.findOne({ email: email.toLowerCase() })
      : await LocalStore.findUserByEmail(email);

    if (existing) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let newUser;
    if (isMongo) {
      newUser = await User.create({
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: 'user'
      });
    } else {
      newUser = await LocalStore.createUser({
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: 'user'
      });
    }

    const token = jwt.sign(
      { id: newUser._id || newUser.id, email: newUser.email, name: newUser.name, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      token,
      user: { id: newUser._id || newUser.id, name: newUser.name, email: newUser.email, role: newUser.role }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }

    const isMongo = getIsMongoConnected();
    const user = isMongo
      ? await User.findOne({ email: email.toLowerCase() })
      : await LocalStore.findUserByEmail(email);

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id || user.id, email: user.email, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: { id: user._id || user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getMe = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }
    const isMongo = getIsMongoConnected();
    const user = isMongo
      ? await User.findById(req.user.id).select('-password')
      : await LocalStore.findUserById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      user: { id: user._id || user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
