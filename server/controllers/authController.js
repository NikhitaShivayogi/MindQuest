const jwt = require('jwt-simple');
const User = require('../models/User');
const { body, validationResult } = require('express-validator');
const serverStartedAt = require('../config/session');

const JWT_SECRET = process.env.JWT_SECRET || 'mindquest-dev-secret-change-me';
const TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000;

const defaultProfile = () => ({
  bio: '',
  interests: [],
  skillLevel: 'Beginner',
  preferredLanguage: 'English',
  goals: '',
  learningStyle: 'Self-paced',
});

const serializeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  createdAt: user.createdAt,
  profile: {
    ...defaultProfile(),
    ...(user.profile || {}),
    interests: Array.isArray(user.profile?.interests) ? user.profile.interests : [],
  },
});

const createToken = (user) => {
  const now = Date.now();
  return jwt.encode(
    {
      userId: user._id,
      email: user.email,
      iat: now,
      sessionStartedAt: serverStartedAt,
      exp: now + TOKEN_EXPIRY_MS,
    },
    JWT_SECRET
  );
};

const validateRegister = [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().withMessage('Please provide a valid email address'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

const validateLogin = [
  body('email').isEmail().withMessage('Please provide a valid email address'),
  body('password').notEmpty().withMessage('Password is required'),
];

const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }

    const newUser = new User({ name, email, password });
    await newUser.save();

    const token = createToken(newUser);

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: serializeUser(newUser),
      expiresAt: Date.now() + TOKEN_EXPIRY_MS,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Error registering user', error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = createToken(user);

    res.json({
      message: 'Login successful',
      token,
      user: serializeUser(user),
      expiresAt: Date.now() + TOKEN_EXPIRY_MS,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: serializeUser(user),
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { bio, interests, skillLevel, preferredLanguage, goals, learningStyle } = req.body || {};

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.profile = {
      ...defaultProfile(),
      ...(user.profile || {}),
      bio: String(bio || user.profile?.bio || '').trim(),
      interests: Array.isArray(interests)
        ? interests.map((item) => String(item).trim()).filter(Boolean).slice(0, 10)
        : Array.isArray(user.profile?.interests)
          ? user.profile.interests
          : [],
      skillLevel: ['Beginner', 'Intermediate', 'Advanced'].includes(skillLevel) ? skillLevel : user.profile?.skillLevel || 'Beginner',
      preferredLanguage: preferredLanguage || user.profile?.preferredLanguage || 'English',
      goals: String(goals || user.profile?.goals || '').trim(),
      learningStyle: ['Self-paced', 'Structured', 'Practice-first', 'Theory-first'].includes(learningStyle)
        ? learningStyle
        : user.profile?.learningStyle || 'Self-paced',
    };

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: serializeUser(user),
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
};

module.exports = {
  register,
  login,
  getCurrentUser,
  updateProfile,
  validateRegister,
  validateLogin,
};
