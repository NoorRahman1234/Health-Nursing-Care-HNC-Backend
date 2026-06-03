// const mongoose = require('mongoose');

// const OtpSchema = new mongoose.Schema({
//   email: { type: String, required: true },
//   code: { type: String, required: true },
//   createdAt: { type: Date, default: Date.now, index: { expires: '5m' } } // Auto-deletes in 5 mins!
// });

// module.exports = mongoose.model('Otp', OtpSchema);




// // import mongoose from 'mongoose'; //  Changed from require()

// // const otpSchema = new mongoose.Schema({
// //   identifier: { 
// //     type: String, 
// //     required: true 
// //   }, // This will store the CNIC or phone number
// //   otp: { 
// //     type: String, 
// //     required: true 
// //   },
// //   createdAt: { 
// //     type: Date, 
// //     default: Date.now, 
// //     expires: 300 // Automatically deletes after 5 minutes (TTL index)
// //   }
// // });

// // // Create and export the model using modern ES Module Named Export
// // const OtpModel = mongoose.model('Otp', otpSchema);
// // // export { OtpModel };
// // // module.exports = { OtpModel };
// // export default OtpModel;



// import mongoose from 'mongoose';

// const otpSchema = new mongoose.Schema({
//   identifier: { 
//     type: String, 
//     required: true 
//   }, 
//   otp: { 
//     type: Number, 
//     required: true, 
//     trim: true
//   },
//   createdAt: { 
//     type: Date, 
//     default: Date.now, 
//     expires: 300 
//   }
// });

// const Otp = mongoose.model('Otp', otpSchema);

// // This is the clean way to export it
// export default Otp;






import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
  identifier: { 
    type: String, 
    required: true 
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