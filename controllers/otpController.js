// //  const Nurse = require('../models/modelNurse')
// //  const Otp = require('../models/OtpModel'); 
// //  const { Otp } = require('../models/OtpModel');
// //  import {Otpschema} from '../models/OtpModel.js';
// // const Otp  = require('../models/OtpModel');
//  import Nurse from '../models/modelNurse.js'
//  import Otp from '../models/OtpModel.js'

 
//  exports.sendOtp = async (req, res) => {
//   try {
//     const { email } = req.body;

//     if (!email) {
//       return res.status(400).json({ success: false, message: "Email is required" });
//     }

//     // Check if nurse already exists as a fully registered user
//     const userExists = await Nurse.findOne({ email });
//     if (userExists) {
//       return res.status(400).json({ success: false, message: "Email  already registered." });
//     }

//     // Generate a 4-digit random code
//     const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();

//     //  Fixed: Save to the separate OTP collection instead of the Nurse collection
//     await Otp.findOneAndUpdate(
//       { email },
//       { code: generatedOtp, createdAt: new Date() },
//       { upsert: true, new: true }
//     );

//     // Print it to your backend console terminal for testing!
//     console.log(`✉️ [HNC OTP Server] Code for ${email} is: ${generatedOtp}`);

//     res.status(200).json({ 
//       success: true, 
//       message: "Verification code sent! Look at your Email.",
//       debugCode: generatedOtp 
//     });

//   } catch (error) {
//     res.status(500).json({ success: false, message: "Failed to send OTP", error: error.message });
//   }
// };







import Otp from '../models/OtpModel.js'; // Imports the model we made in Step 1

// Notice the "export const" instead of "exports."
export const sendOtp = async (req, res) => {
    try {
        const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    // Check if nurse already exists as a fully registered user
    const userExists = await Nurse.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: "Email  already registered." });
    }

    // Generate a 4-digit random code
    const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();

    //  Fixed: Save to the separate OTP collection instead of the Nurse collection
    await Otp.findOneAndUpdate(
      { email },
      { code: generatedOtp, createdAt: new Date() },
      { upsert: true, new: true }
    );

    // Print it to your backend console terminal for testing!
    console.log(`✉️ [HNC OTP Server] Code for ${email} is: ${generatedOtp}`);

    res.status(200).json({ 
      success: true, 
      message: "Verification code sent! Look at your Email.",
      debugCode: generatedOtp 
    });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to send OTP", error: error.message });
    }
};