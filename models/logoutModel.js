
import mongoose from 'mongoose';

const logoutSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now, expires: 86400 } // 86400 seconds = 24 hours (Matches your JWT expiry)
});

const Logout = mongoose.model('Logout', logoutSchema); 
export default Logout;