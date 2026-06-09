
import express from 'express';
const router = express.Router();
import { sendOtp } from '../controllers/otpController.js';
import protect from '../middlewares/logoutMiddleware.js'; 
import { registerNurse, loginNurse, logoutNurse, forgotPassword, resetPassword } from '../controllers/authController.js';



// Routes 
router.post('/send-otp', sendOtp);
router.post('/signup', registerNurse);
router.post('/login', loginNurse);
router.post('/logout', protect, logoutNurse);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;