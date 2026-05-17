
const Nurse = require('../models/modelNurse'); 
const Otp = require('../models/OtpModel'); 
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 1️⃣ GENERATE AND SAVE OTP (Saves ONLY to the temporary Otp collection)
exports.sendOtp = async (req, res) => {
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

    // 🌟 Fixed: Save to the separate OTP collection instead of the Nurse collection
    await Otp.findOneAndUpdate(
      { email },
      { code: generatedOtp, createdAt: new Date() },
      { upsert: true, new: true }
    );

    // Print it to your backend console terminal for testing!
    console.log(`✉️ [HNC OTP Server] Code for ${email} is: ${generatedOtp}`);

    res.status(200).json({ 
      success: true, 
      message: "Verification code sent! Look at your phone message box.",
      debugCode: generatedOtp 
    });

  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to send OTP", error: error.message });
  }
};

// 2️⃣ FINAL SIGNUP FUNCTION: Verify OTP from separate model, then create Nurse profile
exports.registerNurse = async (req, res) => {
  try {
    const {
      name, cnic, mobile, gender,
      hospitalName, hospitalAddress, experienceLevel, shiftStart, shiftEnd,
      email, password, otpCode
    } = req.body;

    // 🌟 Fixed: Verify code directly from your dedicated Otp collection record
    const otpRecord = await Otp.findOne({ email });

    if (!otpRecord || otpRecord.code !== otpCode) {
      return res.status(400).json({ success: false, message: "Invalid or expired verification code." });
    }

    // Check if CNIC already exists before creating a new account record
    const cnicExists = await Nurse.findOne({ cnic });
    if (cnicExists) {
      return res.status(400).json({ success: false, message: "This CNIC is already registered." });
    }

    // Securely hash the chosen password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 🌟 Fixed: Create a brand new clean Nurse document directly in MongoDB
    const newNurse = new Nurse({
      name, cnic, mobile, gender,
      hospitalName, hospitalAddress, experienceLevel, shiftStart, shiftEnd,
      email, 
      password: hashedPassword,
      isVerified: true
    });

    await newNurse.save();

    // Clean up and delete the temporary OTP document out of your database
    await Otp.deleteOne({ email });

    // Generate login status token
    const token = jwt.sign({ id: newNurse._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.status(201).json({
      success: true,
      message: "Registration complete! Nurse profile created successfully.",
      token,
      nurseId: newNurse._id
    });

  } catch (error) {
    res.status(500).json({ success: false, message: "Database registration failed", error: error.message });
  }
};

// Login 
exports.loginNurse = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validation: Check if inputs are empty
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide both email and password."
      });
    }

    // 2. Find User: Search database for the email
    const nurse = await Nurse.findOne({ email });
    
    if (!nurse) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password."
      });
    }

    // 3. Verify Password: Compare incoming password with the database hash
    const isPasswordMatch = await bcrypt.compare(password, nurse.password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password."
      });
    }

    // 4. Verification Check: Check if user completed the OTP phase
    if (!nurse.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Account not verified. Please complete OTP verification first."
      });
    }

    // 5. Success Response
    res.status(200).json({
      success: true,
      message: "Login successful!",
      user: {
        id: nurse._id,
        name: nurse.name,
        email: nurse.email,
        role: nurse.role
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error during login process",
      error: error.message
    });
  }
};
