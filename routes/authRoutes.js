
// const express = require('express');
import express from 'express';
const router = express.Router();
import { sendOtp } from '../controllers/otpController.js';
import { protect } from '../middlewares/logoutMiddleware.js';
import { registerNurse, loginNurse, logoutNurse, forgotPassword, resetPassword } from '../controllers/authController.js';



// Route to generate OTP
router.post('/send-otp', sendOtp);

// Routes 
router.post('/signup', registerNurse);
router.post('/login', loginNurse);
router.post('/logout', protect, logoutNurse);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// module.exports = router;
export default router;