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




// const jwt = require('jsonwebtoken');
// const logout = require('../models/logoutModel'); // 🌟 Fixed: renamed to match usage

// const protect = async (req, res, next) => {
//   let token;

//   if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
//     try {
//       token = req.headers.authorization.split(' ')[1];

//       // 1. CHECK BLACKLIST: Is this token logged out?
//       const logout = await logout.findOne({ token });
//       if (logout) {
//         return res.status(401).json({ 
//           success: false, 
//           message: "Session expired. Please log in again." 
//         });
//       }

//       // 2. Verify token
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);
//       req.user = decoded; // Attaches logged-in user payload to request

//       return next(); // 🌟 Good practice: explicitly return next() to avoid hanging requests
//     } catch (error) {
//       // Console log this during development so you can see exactly why it failed!
//       console.error("JWT Verification Error:", error.message);
      
//       return res.status(401).json({ 
//         success: false, 
//         message: "Not authorized, token failed" 
//       });
//     }
//   }

//   if (!token) {
//     return res.status(401).json({ 
//       success: false, 
//       message: "Not authorized, no token found" 
//     });
//   }
// };

// module.exports = { protect };