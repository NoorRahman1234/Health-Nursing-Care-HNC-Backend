
const express = require('express');
const router = express.Router();
const { sendOtp } = require('../controllers/otpController');
const { protect } = require('../middlewares/logoutMiddleware');
const { registerNurse, loginNurse, logoutNurse } = require('../controllers/authController');



// Route to generate OTP
router.post('/send-otp', sendOtp);

// Routes 
router.post('/signup', registerNurse);
router.post('/login', loginNurse);
router.post('/logout', protect, logoutNurse);

module.exports = router;