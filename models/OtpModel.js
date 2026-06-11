
import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
  identifier: { 
    type: String, 
    required: true 
  }, 

  mobile: { 
  type: String, 
  required: true, 
  unique: true // Ensure no two patients share the same phone number
},
  otp: { 
    type: String, // 👈 Changed to String for safety
    required: true
  },
  createdAt: { 
    type: Date, 
    default: Date.now, 
    expires: 300
    // 👈 We commented out expires to stop background deletions while testing
  }
});

const Otp = mongoose.model('Otp', otpSchema);
export default Otp;