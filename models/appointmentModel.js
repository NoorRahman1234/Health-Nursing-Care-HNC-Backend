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




// import mongoose from 'mongoose';

// const appointmentSchema = new mongoose.Schema({
//   // The Bridge: Linking both Nurse and Patient models
//   patientId: { 
//     type: mongoose.Schema.Types.ObjectId, 
//     ref: 'Patient', // Points to your Patient Model
//     required: true 
//   },
//   nurseId: { 
//     type: mongoose.Schema.Types.ObjectId, 
//     ref: 'Nurse', // Points to your Nurse Model
//     required: true 
//   },

//   // Appointment Data (As seen in your Figma designs)
//   appointmentDate: { type: Date, required: true }, // e.g., 2026-07-17
//   timing: { type: String, required: true },          // e.g., "05:30 PM - 07:30 PM"
//   careCharges: { type: Number, required: true },

//   // Status tracking for both sides
//   status: { 
//     type: String, 
//     enum: ['Upcoming', 'Completed', 'Cancelled'], 
//     default: 'Upcoming' 
//   },

//   // Cancellation Data
//   cancellationDetails: {
//     reason: { type: String },      
//     customComments: { type: String } 
//   }
// }, { timestamps: true });

// const Appointment = mongoose.model('Appointment', appointmentSchema);
// export default Appointment;