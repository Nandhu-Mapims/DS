import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { config } from '../config/index.js';
import { success, error } from '../utils/response.js';

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return error(res, 'Invalid email or password', 401);
    }
    const token = jwt.sign(
      { userId: user._id.toString() },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );
    const u = user.toObject();
    delete u.password;
    return success(res, { user: u, token }, 'Logged in');
  } catch (err) {
    if (err.name === 'MongoServerError' && err.code === 13) {
      console.error('MongoDB authentication failed. Add username:password to MONGO_URI in .env');
      return error(res, 'Database authentication required. Check backend .env MONGO_URI.', 503);
    }
    console.error('Login error:', err.message);
    return error(res, err.message || 'Server error', 500);
  }
}

export async function register(req, res) {
  try {
    const { email, password, name, role } = req.body;
    const existing = await User.findOne({ email });
    if (existing) {
      return error(res, 'Email already registered', 400);
    }
    const user = await User.create({ email, password, name, role: role || 'DOCTOR' });
    const token = jwt.sign(
      { userId: user._id.toString() },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );
    const u = user.toObject();
    delete u.password;
    return success(res, { user: u, token }, 'Registered', 201);
  } catch (err) {
    if (err.name === 'MongoServerError' && err.code === 13) {
      console.error('MongoDB authentication failed. Add username:password to MONGO_URI in .env');
      return error(res, 'Database authentication required. Check backend .env MONGO_URI.', 503);
    }
    console.error('Register error:', err.message);
    return error(res, err.message || 'Server error', 500);
  }
}
