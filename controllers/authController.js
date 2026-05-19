
const Nurse = require('../models/modelNurse'); 
const Otp = require('../models/OtpModel'); 
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const logout = require('../models/logoutModel');


exports.registerNurse = async (req, res) => {
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
exports.loginNurse = async (req, res) => {
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
exports.logoutNurse = async (req, res) => {
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











