// import  mongoose from 'mongoose';
const mongoose = require ('mongoose');

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
  isVerified: { type: Boolean, default: false }, // Saved for the OTP validation phase
  // Inside your nurseSchema definition
  isOnline: {
  type: Boolean,
  default: false // Nurses start offline by default when they register
},


// Add or merge these fields inside your existing nurseSchema definition
hourlyFee: {
  type: Number,
  default: 1000 // A logical default starting value
},
availability: {
  from: { type: String, default: "10:00 AM" },
  to: { type: String, default: "08:00 PM" }
},
hospitalName: {
  type: String,
  default: ""
},
specialization: {
  type: String,
  default: ""
},
description: {
  type: String,
  default: ""
}

}, { timestamps: true });

module.exports = mongoose.model('Nurse', nurseSchema);
// export default Nurse;









