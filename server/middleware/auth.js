const jwt = require('jwt-simple');
const JWT_SECRET = process.env.JWT_SECRET || 'mindquest-dev-secret-change-me';

const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.decode(token, JWT_SECRET);

    if (decoded.exp && Date.now() > decoded.exp) {
      return res.status(401).json({ message: 'Token has expired. Please login again.' });
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = authMiddleware;
