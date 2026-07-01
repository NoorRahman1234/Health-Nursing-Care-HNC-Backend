

import PatientAppointment from '../models/PatientAppointment.js';

// @desc    Create a new appointment
// @route   POST /api/patient-appointments
export const createPatientAppointment = async (req, res) => {
    try {
        const { gender, age, date, time, proposedPrice, description, nurseId } = req.body;

        const newAppointment = new PatientAppointment({
            gender,
            age,
            date,
            time,
            proposedPrice,
            description,
            nurseId
        });

        const savedData = await newAppointment.save();
        res.status(201).json({ success: true, data: savedData });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Get all patient appointments (Fallback/Admin view)
// @route   GET /api/patient-appointments
export const getPatientAppointments = async (req, res) => {
    try {
        const appointments = await PatientAppointment.find().populate('nurseId', 'name profilePicture rating');
        res.status(200).json({ success: true, data: appointments });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update appointment status when clicking 'Yes' or 'No' on confirmation modal

export const updateAppointmentStatus = async (req, res) => {
    try {
        const { status } = req.body; 
        
        const updatedStatus = await PatientAppointment.findByIdAndUpdate(
            req.params.id,
            { status },
            { returnDocument: 'after' } // Changed from { new: true } to fix the warning
        );

        if (!updatedStatus) {
            return res.status(404).json({ success: false, message: 'Appointment not found' });
        }

        res.status(200).json({ success: true, data: updatedStatus });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Cancel an Appointment with survey rules
// @route   PUT /api/patient-appointments/cancel/:appointmentId
export const cancelAppointment = async (req, res) => {
    try {
        const { appointmentId } = req.params;
        const { reasonType, customComments } = req.body;

        // 1. Fetch appointment details
        const appointment = await PatientAppointment.findById(appointmentId);
        if (!appointment) {
            return res.status(404).json({ success: false, message: "Appointment not found." });
        }

        // 2. Enforce structural blocks (Screen 23 check)
        if (appointment.status === 'Cancelled') {
            return res.status(400).json({ success: false, message: "This appointment is already cancelled." });
        }
        if (appointment.status === 'Rejected') {
            return res.status(400).json({ success: false, message: "Sorry, you cannot cancel a rejected appointment." });
        }

        // 3. FIXED: Split time string ("05:00 PM - 07:30 PM") to safely parse the start time
        const startTime = appointment.time.split(' - ')[0].trim();
        const appointmentDateTime = new Date(`${appointment.date} ${startTime}`);
        const now = new Date();
        const timeDifferenceInMs = appointmentDateTime - now;
        const hoursDifference = timeDifferenceInMs / (1000 * 60 * 60);

        // Screen 24 validation check (Within 24 Hours rule)
        if (hoursDifference < 24 && hoursDifference > 0) {
            return res.status(400).json({
                success: false,
                code: "POLICY_RESTRICTION_24H",
                message: "Cancellations cannot be made within 24 hours of your scheduled appointment."
            });
        }

        // Screen 23 general fallback check (e.g. time has completely passed)
        if (hoursDifference <= 0) {
            return res.status(400).json({
                success: false,
                code: "GENERAL_RESTRICTION",
                message: "Sorry, you can not cancel this appointment."
            });
        }

        // 4. Update documentation state on success (Screen 26 track)
        appointment.status = 'Cancelled';
        appointment.cancellationReason = {
            reasonType,
            customComments: reasonType === 'Other' ? customComments : undefined
        };

        await appointment.save();

        return res.status(200).json({
            success: true,
            message: "Appointment Cancelled",
            appointment
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error during cancellation processing.",
            error: error.message
        });
    }
};

// @desc    Separate past and upcoming appointments for UI Tabs
// @route   GET /api/patient-appointments/tabs/categorized
export const getSeparatedAppointments = async (req, res) => {
    try {
        // Fetch all appointments and populate nurse details
        // Note: Filter criteria can be added here once a patientId field exists in the schema
        const appointments = await PatientAppointment.find() 
            .populate('nurseId', 'name profilePicture rating') 
            .sort({ createdAt: -1 });

        const now = new Date();
        const upcoming = [];
        const past = [];

        appointments.forEach((app) => {
            // FIXED: Safely split your slot string format to avoid invalid JavaScript evaluation
            const startTime = app.time.split(' - ')[0].trim();
            const appointmentDateTime = new Date(`${app.date} ${startTime}`);

            // Logic matching "Upcoming" vs "Past" tabs from the video
            if (
                (app.status === 'Pending' || app.status === 'Confirmed') && 
                appointmentDateTime > now
            ) {
                upcoming.push(app);
            } else {
                // If status is 'Cancelled', 'Rejected', or the slot time window has passed
                past.push(app);
            }
        });

        return res.status(200).json({
            success: true,
            data: {
                upcoming,
                past
            }
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error fetching categorized appointments.",
            error: error.message
        });
    }
};

// @desc    Rebook a historical appointment

export const rebookAppointment = async (req, res) => {
    try {
        const { oldAppointmentId } = req.params;
        const { date, time, proposedPrice, description, gender, age } = req.body;

        // 1. Fetch the historical baseline appointment
        const historicAppointment = await PatientAppointment.findById(oldAppointmentId);
        if (!historicAppointment) {
            return res.status(404).json({ success: false, message: "Historical appointment record not found." });
        }

        // 2. Instantiate a fresh appointment document using updated inputs or fallback baselines
        const newAppointment = new PatientAppointment({
            gender: gender || historicAppointment.gender,
            age: age || historicAppointment.age,
            date: date || historicAppointment.date, 
            time: time || historicAppointment.time, 
            proposedPrice: proposedPrice || historicAppointment.proposedPrice,
            description: description || historicAppointment.description,
            nurseId: historicAppointment.nurseId, // Rebook same nurse (Screen 21)
            status: 'Pending' // Resets back to default pending status
        });

        // 3. Persist to database
        await newAppointment.save();

        return res.status(201).json({
            success: true,
            message: "Rebooking request initiated successfully.",
            appointment: newAppointment
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error while processing rebooking.",
            error: error.message
        });
    }
};