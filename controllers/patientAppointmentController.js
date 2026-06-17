import PatientAppointment from '../models/PatientAppointment.js';


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

// @desc    Get all patient appointments
// @route   GET /api/patient-appointments
export const getPatientAppointments = async (req, res) => {
    try {
        const appointments = await PatientAppointment.find();
        res.status(200).json({ success: true, data: appointments });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update appointment status when clicking 'Yes' or 'No' on confirmation modal
// @route   PATCH /api/patient-appointments/:id/status
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

