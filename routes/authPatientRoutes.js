import express from 'express';
import { 
  registerPatient, 
  loginPatient, 
  forgotPasswordPatient, 
  resetPasswordPatient 
} from '../controllers/authPatientController.js';

const router = express.Router();

// Base URL context: /api/auth/patient
router.post('/register', registerPatient);
router.post('/login', loginPatient);
router.post('/forgot-password', forgotPasswordPatient);
router.post('/reset-password', resetPasswordPatient);

export default router;