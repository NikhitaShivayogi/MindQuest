const express = require('express');
const { register, login, getCurrentUser, updateProfile, validateRegister, validateLogin } = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.get('/me', authMiddleware, getCurrentUser);
router.get('/profile', authMiddleware, getCurrentUser);
router.put('/profile', authMiddleware, updateProfile);

module.exports = router;
