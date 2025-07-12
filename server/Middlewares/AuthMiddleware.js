// Example: middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/UserModel'); // Use a single, consistent path
exports.requireAuth = (req, res, next) => {
    // Check if the user ID is stored in the session
    if (req.session && req.session.userId) {
        return next(); // User is authenticated, proceed to the controller
    } else {
        // User is not authenticated
        return res.status(401).json({ message: "Unauthorized: You must be logged in to view this content." });
    }
};
exports.verifyToken = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ status: false, message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    req.user = await User.findById(decoded.id).select('-password'); // Attach user to request but exclude password
    if (!req.user) {
        return res.status(401).json({ status: false, message: 'Invalid token.' });
    }
    next(); 
  } catch (ex) {
    res.status(400).json({ status: false, message: 'Invalid token.' });
  }
};
