
// const Nurse = require('../models/modelNurse');
// import modelNurse from '../models/modelNurse.js'; 
// const Otp = require('../models/OtpModel'); 
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const logout = require('../models/logoutModel');

import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import modelNurse from '../models/modelNurse.js';
import Nurse from '../models/modelNurse.js';
// import { OtpModel } from '../models/OtpModel.js'; 
import OtpModel from '../models/OtpModel.js';// Must use import and .js
import logout from '../models/logoutModel.js'
import Otp from '../models/OtpModel.js';
// exports.registerNurse = async (req, res) => {
  export const registerNurse = async (req, res) => {
  try {
    const {
      name, cnic, mobile, gender,
      hospitalName, hospitalAddress, experienceLevel, shiftStart, shiftEnd,
      password, 
    } = req.body;

    // 1. Validation Check: CNIC already exists
    const cnicExists = await Nurse.findOne({ cnic });
    if (cnicExists) {
      const errorResponse = { success: false, message: "This CNIC is already registered." };
      
      // Mirroring the Postman response in the terminal
      console.log("⚠️  [Postman Response Mirror]:", errorResponse);
      
      return res.status(400).json(errorResponse);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newNurse = new Nurse({
      name, cnic, mobile, gender,
      hospitalName, hospitalAddress, experienceLevel, shiftStart, shiftEnd, 
      password: hashedPassword,
      isVerified: true
    });

    // Save to database
    await newNurse.save();

    // 2. Success Response
    const successResponse = {
      success: true,
      message: "Registration complete! Nurse profile created successfully.",
      Nurse: newNurse._doc,
    };

    // Mirroring the Postman response in the terminal
    console.log("✅ [Postman Response Mirror]:", JSON.stringify(successResponse, null, 2));

    return res.status(201).json(successResponse);

  } catch (error) {
    // 3. Database / Server Error Response
    const serverErrorResponse = { 
      success: false, 
      message: "Database registration failed", 
      error: error.message 
    };

    // Mirroring the Postman response in the terminal
    console.log("❌ [Postman Response Mirror]:", serverErrorResponse);

    return res.status(500).json(serverErrorResponse);
  }
};


// // Login Nurse
// exports.loginNurse = async (req, res) => {
  export const loginNurse = async (req, res) => {
  try {
    const { cnic, password } = req.body;

    // 1. Validation: Check if inputs are empty
    if (!cnic || !password) {
      const errorResponse = {
        success: false,
        message: "Please provide both cnic and password."
      };
      
      console.log("⚠️  [Postman Login Mirror]:", errorResponse);
      return res.status(400).json(errorResponse);
    }

    // 2. Find User: Search database for the CNIC
    const nurse = await Nurse.findOne({ cnic });
    
    if (!nurse) {
      const errorResponse = {
        success: false,
        message: "Invalid cnic or password."
      };

      console.log("⚠️  [Postman Login Mirror]:", errorResponse);
      return res.status(401).json(errorResponse);
    }

    // 3. Verify Password: Compare incoming password with the database hash
    const isPasswordMatch = await bcrypt.compare(password, nurse.password);

    if (!isPasswordMatch) {
      const errorResponse = {
        success: false,
        message: "Invalid cnic or password."
      };

      console.log("⚠️  [Postman Login Mirror]:", errorResponse);
      return res.status(401).json(errorResponse);
    }

    // 4. Verification Check: Check if user completed the OTP phase
    if (!nurse.isVerified) {
      const errorResponse = {
        success: false,
        message: "Account not verified. Please complete OTP verification first."
      };

      console.log("⚠️  [Postman Login Mirror]:", errorResponse);
      return res.status(403).json(errorResponse);
    }

    // 5. Generate JWT Token
    const token = jwt.sign(
      { id: nurse._id, role: nurse.role }, 
      process.env.JWT_SECRET,             
      { expiresIn: '1d' }                 
    );

    // 6. Success Response with Token
    const successResponse = {
      success: true,
      message: "Login successful!",
      token: token 
    };

    // Printing the clean formatted success JSON in terminal
    console.log("✅ [Postman Login Mirror]:", JSON.stringify(successResponse, null, 2));
    return res.status(200).json(successResponse);

  } catch (error) {
    // 7. Server Error Response
    const serverErrorResponse = {
      success: false,
      message: "Server Error during login process",
      error: error.message
    };

    console.log("❌ [Postman Login Mirror]:", serverErrorResponse);
    return res.status(500).json(serverErrorResponse);
  }
};


// Logout Nurse
// exports.logoutNurse = async (req, res) => {
  export  const logoutNurse = async (req, res) => {

  try {
    // 1. Extract the token from Authorization Header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(400).json({ success: false, message: "No token provided to log out." });
    }

    const token = authHeader.split(' ')[1];

    // 2. Add the token to your database blacklist
    const islogout = await logout.findOne({ token });
    if (!islogout) {
      await logout.create({ token });
    }

    // 3. Send successful response
    res.status(200).json({
      success: true,
      message: "Logout successful! "
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error during logout process",
      error: error.message
    });
  }
};


// import { OtpModel } from '../models/OtpModel.js';
// import modelNurse from '../models/modelNurse.js'; // Adjust the path if your model name is different
// import bcrypt from 'bcryptjs';
// import jwt from 'jsonwebtoken';

// ==========================================
// 1. FORGOT PASSWORD (Request OTP)
// ==========================================
export const forgotPassword = async (req, res) => {
    try {
        const { cnic } = req.body; // Using CNIC as the unique identifier

        if (!cnic) {
            return res.status(400).json({ success: false, message: "cnic  is required." });
        }

        // Step 1: Verify the nurse/user exists in the database
        const user = await modelNurse.findOne({ cnic });
        if (!user) {
            return res.status(404).json({ success: false, message: "No account found with this cnic." });
        }

        // Step 2: Generate a secure 6-digit random OTP
        const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

        // Step 3: Save the OTP to OtpModel (updates if it exists, creates if it doesn't)
        await OtpModel.findOneAndUpdate(
            { identifier: cnic },
            { otp: generatedOtp, createdAt: Date.now() },
            { upsert: true, new: true }
        );

        // Step 4: Send the OTP
        console.log(`[TESTING] OTP for CNIC ${cnic} is: ${generatedOtp}`);
        // Note: When ready, integrate your SMS/Email API here to send generatedOtp to user.phone

        return res.status(200).json({ 
            success: true, 
            message: "Password reset OTP sent successfully to your registered device." 
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// ==========================================
// 2. RESET PASSWORD (Verify & Update)
// // ==========================================
// export const resetPassword = async (req, res) => {
//     try {
//         const { email, otp, newPassword } = req.body;

//         if (!email || !otp || !newPassword) {
//             return res.status(400).json({ success: false, message: "All fields (email, OTP, New Password) are required." });
//         }

//         // Step 1: Check if the OTP exists for this CNIC
//         // const otpRecord = await OtpModel.findOne({ identifier: cnic });
//         // This succeeds because it uses 'identifier' and 'otp' to match your schema!
//         const record = await Otp.findOne({ identifier: email, otp: otp });
//         if (!otp) {
//             return res.status(400).json({ success: false, message: "OTP expired or invalid. Please request a new one." });
//         }

//         // Step 2: Verify if the user's submitted OTP matches the DB record
//         if (otp !== otp) {
//             return res.status(400).json({ success: false, message: "Incorrect OTP code." });
//         }

//         // Step 3: Find the user to update
//         const user = await modelNurse.findOne({ email });
//         if (!user) {
//             return res.status(404).json({ success: false, message: "User not found." });
//         }

//         // Step 4: Hash the new password safely
//         const salt = await bcrypt.genSalt(10);
//         const hashedPassword = await bcrypt.hash(newPassword, salt);

//         // Step 5: Save new password and delete the OTP record so it can't be reused
//         user.password = hashedPassword;
//         await user.save();
//         await OtpModel.deleteOne({ identifier: cnic });

//         return res.status(200).json({ 
//             success: true, 
//             message: "Password reset successful! You can now log in with your new password." 
//         });

//     } catch (error) {
//         return res.status(500).json({ success: false, message: "Server Error", error: error.message });
//     }
// };

export const resetPassword = async (req, res) => {
    try {
        const { cnic, otp, newPassword } = req.body;

        // Check if all fields are provided
        if (!cnic || !otp || !newPassword) {
            return res.status(400).json({ 
                success: false, 
                message: "All fields (cnic, OTP, New Password) are required." 
            });
        }

        // Clean up inputs to prevent typo mismatches
        const cleancnic = cnic.trim().toLowerCase();

        // Step 1: Look for the OTP record using the 'record' variable name
        const record = await Otp.findOne({ identifier: cleancnic, otp: String(otp).trim() });
        
        // FIX 1: Check the database result (record), NOT the req.body variable (otp)
        if (!record) {
            return res.status(400).json({ 
                success: false, 
                message: "OTP expired or invalid. Please request a new one." 
            });
        }

        // Step 2: Find the user to update
        // FIX 2: Using the clean trimmed email to search your modelNurse collection
        const user = await modelNurse.findOne({ cnic: cleancnic });
        
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: "User not found. Please check your registered email address." 
            });
        }

        // Step 3: Hash the new password safely
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Step 4: Save new password 
        user.password = hashedPassword;
        await user.save();
        
        // Step 5: Delete the OTP record so it can't be reused safely
        // FIX 3: Replaced the broken 'cnic' variable with 'cleanEmail'
        await Otp.deleteOne({ identifier: cleancnic });

        return res.status(200).json({ 
            success: true, 
            message: "Password reset successful! You can now log in with your new password." 
        });

    } catch (error) {
        return res.status(500).json({ 
            success: false, 
            message: "Server Error", 
            error: error.message 
        });
    }
};



