import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema({
  // Personal Details
  name: { type: String, required: true },
  cnic: { type: String, required: true, unique: true },
  mobile: { type: String, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  
  // Patient-Specific Fields
  age: { type: Number, required: true },
  homeAddress: { type: String, required: true },
  
  // Tap to pick up exact location (GeoJSON Format)
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // Expects array sequence: [longitude, latitude]
      required: true
    }
  },

  // Security & Access
  password: { type: String, required: true },
  role: { type: String, default: 'Patient' },
  isVerified: { type: Boolean, default: false }
}, { timestamps: true });

// Crucial index for map queries ("find nurses/patients near me")
patientSchema.index({ location: '2dsphere' });

const Patient = mongoose.model('Patient', patientSchema);
export default Patient;