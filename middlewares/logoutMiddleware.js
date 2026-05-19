const jwt = require('jsonwebtoken');
const logout = require('../models/logoutModel');


const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // 🌟 CHECK BLACKLIST: Is this token logged out?
      const isBlacklisted = await logout.findOne({ token });
      if (isBlacklisted) {
        return res.status(401).json({ success: false, message: "Session expired. Please log in again." });
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded; // Attaches logged-in nurse/patient id to request

      next();
    } catch (error) {
      return res.status(401).json({ success: false, message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: "Not authorized, no token found" });
  }
};

module.exports = { protect };


