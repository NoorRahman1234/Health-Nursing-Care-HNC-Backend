const mongoose = require('mongoose');

const OtpSchema = new mongoose.Schema({
  email: { type: String, required: true },
  code: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, index: { expires: '5m' } } // Auto-deletes in 5 mins!
});

module.exports = mongoose.model('Otp', OtpSchema);