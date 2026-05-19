const mongoose = require('mongoose');

const nurseSchema = new mongoose.Schema({
  // Step 1: Personal Details
  name: { type: String, required: true },
  cnic: { type: String, required: true, unique: true },
  mobile: { type: String, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },

  // Step 2: Hospital Details
  hospitalName: { type: String, required: true },
  hospitalAddress: { type: String, required: true },
  experienceLevel: { type: String, enum: ['Fresher', 'Intermediate', 'Expert'], required: true },
  shiftStart: { type: String, required: true }, // e.g., "09:00 AM"
  shiftEnd: { type: String, required: true },   // e.g., "05:00 PM"

  // Step 3: Security & Access
  password: { type: String, required: true },
  role: { type: String, default: 'Nurse' },
  isVerified: { type: Boolean, default: false } ,// Saved for the OTP validation phase

}, { timestamps: true });

module.exports = mongoose.model('Nurse', nurseSchema);










