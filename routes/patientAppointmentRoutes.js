// routes/patientAppointmentRoutes.js
import express from 'express';
import {
    createPatientAppointment,
    getPatientAppointments,
    updateAppointmentStatus, 
    cancelAppointment, getSeparatedAppointments, rebookAppointment
} from '../controllers/patientAppointmentController.js';

const router = express.Router();

// Base endpoint: /api/appointments (or whatever base path you mount this router on)
router.route('/')
    .post(createPatientAppointment) 
    .get(getPatientAppointments); // Chained correctly to the root path



 router.route('/tabs/categorized')
    .get(getSeparatedAppointments);

// Specific status modification endpoint (PATCH)
router.route('/:id/status')
    .patch(updateAppointmentStatus);

// Cancellation endpoint matching your controller parameters (PUT)
router.route('/cancel/:appointmentId')
    .put(cancelAppointment);
    
router.route('/rebook/:oldAppointmentId')
    .post(rebookAppointment);
    
export default router;