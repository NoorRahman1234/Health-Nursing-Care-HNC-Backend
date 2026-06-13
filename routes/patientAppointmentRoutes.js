import express from 'express';
import {
    createPatientAppointment,
    getPatientAppointments,
    updateAppointmentStatus} from '../controllers/patientAppointmentController.js';

const router = express.Router();

router.route('/')
    .post(createPatientAppointment)
    .get(getPatientAppointments);

router.route('/:id/status')
    .patch(updateAppointmentStatus);

export default router;