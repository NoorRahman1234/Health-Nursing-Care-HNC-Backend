import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  patientName: { 
    type: String, 
    required: true 
  },
  patientAge: { 
    type: Number, 
    required: true 
  },
  patientGender: { 
    type: String, 
    enum: ['Male', 'Female', 'Other'], 
    required: true 
  },
  description: { 
    type: String, 
    required: true // e.g., "My mother needs assistance with walking..."
  },
  timings: { 
    type: String, 
    required: true // e.g., "03:30 PM - 05:30 PM"
  },
  proposedFee: { 
    type: Number, 
    required: true // e.g., 2000
  },
  // Keeps track of which nurse accepted the job. Starts as null.
  assignedNurse: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Nurse', 
    default: null 
  },
  status: {
    type: String,
    required: true,
    enum: ['Pending', 'Accepted', 'In-Progress', 'Cancelled', 'Completed'], 
    default: 'Pending'
},

  appointmentDate: {
        type: Date,
        default: Date.now
    },

    
    review: {
    feeReceived: { type: Boolean, default: false },
    rating: { type: Number, min: 1, max: 5 },
    comments: { type: String, default: "" },
    submittedAt: { type: Date }
},


patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient"
},

  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

const Appointment = mongoose.model('Appointment', appointmentSchema);
export default Appointment;