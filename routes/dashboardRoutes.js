import express from 'express';
import { getNurseFeed, acceptAppointment,
     toggleOnlineStatus, getMyBookedAppointments, createAppointment,
      getNurseProfile, updateNurseProfile, getMyAppointments, cancelAppointmentByNurse
      ,getCancellationReasons, updateAppointmentStatus,getAvailableJobsFeed,submitAppointmentReview } from '../controllers/dashboardController.js';

const router = express.Router();

// Routes
router.get('/feed', getNurseFeed);
router.patch('/accept', acceptAppointment);
router.patch('/toggle-status', toggleOnlineStatus);
router.get('/my-bookings', getMyBookedAppointments);
router.get('/profile', getNurseProfile);
router.put('/profile-update', updateNurseProfile);
router.post('/create-appointment', createAppointment);
router.get('/my-appointments', getMyAppointments);
router.patch('/cancel-appointment', cancelAppointmentByNurse);
router.get('/cancellation-reasons', getCancellationReasons);
router.patch('/update-status', updateAppointmentStatus);
router.get('/jobs-feed', getAvailableJobsFeed);
router.post('/submit-review', submitAppointmentReview);
export default router;