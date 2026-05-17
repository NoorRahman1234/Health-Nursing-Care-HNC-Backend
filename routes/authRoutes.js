
const express = require('express');
const router = express.Router();
const { registerNurse, sendOtp} = require('../controllers/authController');
const { loginNurse } = require('../controllers/authController');

// Route to generate OTP
router.post('/send-otp', sendOtp);

// The route that will handle your combined Figma multi-step submission data
router.post('/signup', registerNurse);

// login Routes 
router.post('/login', loginNurse);

module.exports = router;