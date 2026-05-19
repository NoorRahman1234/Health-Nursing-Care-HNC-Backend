const mongoose = require('mongoose');

const logout = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now, expires: 86400 } // 86400 seconds = 24 hours (Matches your JWT expiry)
});

module.exports = mongoose.model('logout', logout);