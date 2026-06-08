import express from 'express';
import { getNurseFeed, acceptAppointment,
     toggleOnlineStatus, getMyBookedAppointments,
      getNurseProfile, updateNurseProfile, getMyAppointments, cancelAppointmentByNurse } from '../controllers/dashboardController.js';

const router = express.Router();

// Routes
router.get('/feed', getNurseFeed);
router.patch('/accept', acceptAppointment);
router.patch('/toggle-status', toggleOnlineStatus);
router.get('/my-bookings', getMyBookedAppointments);
router.get('/profile', getNurseProfile);
router.put('/profile-update', updateNurseProfile);
router.get('/my-appointments', getMyAppointments);
router.patch('/cancel-appointment', cancelAppointmentByNurse);
export default router;