// import mongoose from 'mongoose';

// const PatientAppointmentSchema = new mongoose.Schema({
//     // Fields from the "PATIENT DETAILS" form modal in your video
//     gender: {
//         type: String,
//         enum: ['Male', 'Female', 'Age'], // Matches your form's button labels
//         required: true
//     },
//     age: {
//         type: Number,
//         required: true
//     },
//     date: {
//         type: String, // e.g., "23 June, 2026"
//         required: true
//     },
//     time: {
//         type: String, // e.g., "12:00 PM"
//         required: true
//     },
//     proposedPrice: {
//         type: Number, // Captures the "$1500 / hr" input
//         required: true
//     },
//     description: {
//         type: String, // Captures "Please input description..."
//         trim: true
//     },
//     // Handles the "Confirm your appointment: Yes / No" status step
//     status: {
//         type: String,
//         enum: ['Pending', 'Confirmed', 'Rejected'],
//         default: 'Pending'
//     },
//     // The ID of the nurse being viewed/booked on the screen
//     nurseId: {
//         type: String,
//         required: true
//     }
// }, {
//     timestamps: true
// });

// const PatientAppointment = mongoose.model('PatientAppointment', PatientAppointmentSchema);
// export default PatientAppointment;




import mongoose from 'mongoose';

const PatientAppointmentSchema = new mongoose.Schema({
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Age'], 
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    date: {
        type: String, // e.g., "23 June, 2026"
        required: true
    },
    time: {
        type: String, // e.g., "12:00 PM"
        required: true
    },
    proposedPrice: {
        type: Number, 
        required: true
    },
    description: {
        type: String, 
        trim: true
    },
    // 1. UPDATED: Added 'Cancelled' to the state options
    status: {
        type: String,
        enum: ['Pending', 'Confirmed', 'Rejected', 'Cancelled'],
        default: 'Pending'
    },
    // 2. UPDATED: Relational reference instead of a plain string
    nurseId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', // Points to your Nurse or User model
        required: true
    },
    // 3. NEW: Stores feedback from Screen 25 when an appointment is dropped
    cancellationReason: {
        reasonType: { 
            type: String // Captures options like "No longer need the service", "Price is too high", etc.
        },
        customComments: { 
            type: String // Captures text from "Please specify other reason"
        }
    }
}, {
    timestamps: true
});

const PatientAppointment = mongoose.model('PatientAppointment', PatientAppointmentSchema);
export default PatientAppointment;