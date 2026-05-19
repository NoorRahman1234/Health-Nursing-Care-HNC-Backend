// const logout = require('../models/logoutModel');

// // Logout Nurse
// exports.logoutNurse = async (req, res) => {
//   try {
//     // 1. Extract the token from Authorization Header
//     const authHeader = req.headers.authorization;
//     if (!authHeader || !authHeader.startsWith('Bearer ')) {
//       return res.status(400).json({ success: false, message: "No token provided to log out." });
//     }

//     const token = authHeader.split(' ')[1];

//     // 2. Add the token to your database blacklist
//     const isBlacklisted = await Blacklist.findOne({ token });
//     if (!isBlacklisted) {
//       await Blacklist.create({ token });
//     }

//     // 3. Send successful response
//     res.status(200).json({
//       success: true,
//       message: "Logout successful! Token has been invalidated."
//     });

//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Server error during logout process",
//       error: error.message
//     });
//   }
// };