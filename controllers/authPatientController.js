import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Patient from '../models/authPatientModel.js';
import Otp from '../models/OtpModel.js';
import logout from '../models/logoutModel.js';

// 1. REGISTER PATIENT
export const registerPatient = async (req, res) => {
  try {
    const {
      name, cnic, mobile, gender,
      age, homeAddress, latitude, longitude,
      password
    } = req.body;

    // Validation: Check if CNIC already exists
    const cnicExists = await Patient.findOne({ cnic });
    if (cnicExists) {
      const errorResponse = { success: false, message: "This CNIC is already registered as a Patient." };
      console.log("⚠️  [Postman Patient Register Mirror]:", errorResponse);
      return res.status(400).json(errorResponse);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newPatient = new Patient({
      name, cnic, mobile, gender,
      age, homeAddress,
      location: {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)] // [Lng, Lat]
      },
      password: hashedPassword,
      isVerified: true // Set to false if you intend to run the OTP activation phase first
    });

    await newPatient.save();

    const successResponse = {
      success: true,
      message: "Registration complete! Patient profile created successfully.",
      Patient: newPatient._doc,
    };

    console.log("✅ [Postman Patient Register Mirror]:", JSON.stringify(successResponse, null, 2));
    return res.status(201).json(successResponse);

  } catch (error) {
    const serverErrorResponse = { success: false, message: "Database registration failed", error: error.message };
    console.log("❌ [Postman Patient Register Mirror]:", serverErrorResponse);
    return res.status(500).json(serverErrorResponse);
  }
};

// 2. LOGIN PATIENT
export const loginPatient = async (req, res) => {
  try {
    const { cnic, password } = req.body;

    if (!cnic || !password) {
      return res.status(400).json({ success: false, message: "Please provide both cnic and password." });
    }

    const patient = await Patient.findOne({ cnic });
    if (!patient || !(await bcrypt.compare(password, patient.password))) {
      return res.status(401).json({ success: false, message: "Invalid cnic or password." });
    }

    if (!patient.isVerified) {
      return res.status(403).json({ success: false, message: "Account not verified. Complete OTP phase first." });
    }

    const token = jwt.sign(
      { id: patient._id, role: patient.role }, 
      process.env.JWT_SECRET,            
      { expiresIn: '1d' }                 
    );

    const successResponse = { success: true, message: "Login successful!", token };
    console.log("✅ [Postman Patient Login Mirror]:", JSON.stringify(successResponse, null, 2));
    return res.status(200).json(successResponse);

  } catch (error) {
    return res.status(500).json({ success: false, message: "Server Error during login process", error: error.message });
  }
};

// 3. FORGOT PASSWORD (Patient)
export const forgotPasswordPatient = async (req, res) => {
  try {
    const { mobile } = req.body;
    if (!mobile) return res.status(400).json({ success: false, message: "mobile No is required." });

    const user = await Patient.findOne({ mobile });
    if (!user) return res.status(404).json({ success: false, message: "No patient account found with this cnic." });

    const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();

    await Otp.findOneAndUpdate(
      { identifier: mobile },
      { otp: generatedOtp, createdAt: Date.now() },
      { upsert: true, new: true }
    );

    console.log(`[TESTING] Patient OTP for MOBILE ${mobile} is: ${generatedOtp}`);
    return res.status(200).json({ success: true, message: "Password reset OTP sent to patient device." });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

// 4. RESET PASSWORD (Patient)
export const resetPasswordPatient = async (req, res) => {
  try {
    const { mobile, otp, newPassword } = req.body;
    if (!mobile || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    }

    const cleanmobile = mobile.trim().toLowerCase();
    const record = await Otp.findOne({ identifier: cleanmobile, otp: String(otp).trim() });
    
    if (!record) return res.status(400).json({ success: false, message: "OTP expired or invalid." });

    const user = await Patient.findOne({ mobile: cleanmobile });
    if (!user) return res.status(404).json({ success: false, message: "Patient user not found." });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();
    
    await Otp.deleteOne({ identifier: cleanmobile });

    return res.status(200).json({ success: true, message: "Patient password reset successful!" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};