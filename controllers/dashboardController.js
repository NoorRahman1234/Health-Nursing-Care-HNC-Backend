import Appointment from '../models/appointmentModel.js';
import modelNurse from '../models/modelNurse.js';


// 1. Fetch all available requests for the Nurse Feed (Screen 46)
export const getNurseFeed = async (req, res) => {
    try {
        // Find all appointments that have not been taken yet ('Pending')
        // Sort by newest first
        const availableJobs = await Appointment.find({ status: 'Pending' }).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: availableJobs.length,
            data: availableJobs
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error fetching dashboard feed.",
            error: error.message
        });
    }
};



export const acceptAppointment = async (req, res) => {
    try {
        const { appointmentId, nurseId } = req.body;

        if (!appointmentId || !nurseId) {
            return res.status(400).json({ success: false, message: "Required fields missing." });
        }

        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) {
            return res.status(404).json({ success: false, message: "Appointment not found." });
        }

        if (appointment.status !== 'Pending') {
            return res.status(400).json({ success: false, message: "Job already taken." });
        }

        // 1. Update appointment state in database
        appointment.status = 'Accepted';
        appointment.assignedNurse = nurseId;
        await appointment.save();

        // 2. ⚡ TRIGGER REAL-TIME NOTIFICATION TO THE PATIENT
        const io = req.app.get('socketio');
        
        // Assuming your appointment model references the patient's unique ID as patientId
        if (appointment.patientId) {
            io.to(appointment.patientId.toString()).emit('appointment_accepted', {
                message: "A nurse has accepted your booking request!",
                appointment: appointment
            });
        }

        return res.status(200).json({
            success: true,
            message: "Appointment confirmed successfully!",
            data: appointment
        });

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};



// Toggle Nurse Online/Offline Status (Screen 46 Toggle Switch)
export const toggleOnlineStatus = async (req, res) => {
    try {
        const { nurseId, isOnline } = req.body; // In production, grab nurseId from your auth middleware (req.user.id)

        if (nurseId === undefined || isOnline === undefined) {
            return res.status(400).json({
                success: false,
                message: "Nurse ID and isOnline status value are required."
            });
        }

        // Find the nurse and update their online availability
        const nurse = await modelNurse.findByIdAndUpdate(
            nurseId,
            { isOnline: isOnline },
            { new: true } // Returns the updated document
        );

        if (!nurse) {
            return res.status(404).json({
                success: false,
                message: "Nurse profile not found."
            });
        }

        return res.status(200).json({
            success: true,
            message: `Status successfully updated to ${nurse.isOnline ? 'Online' : 'Offline'}.`,
            isOnline: nurse.isOnline
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error toggling online status.",
            error: error.message
        });
    }
};




// Fetch all appointments accepted by a specific nurse (My Bookings Screen)
export const getMyBookedAppointments = async (req, res) => {
    try {
        const { nurseId } = req.query; // In production, replace with req.user.id from auth middleware

        if (!nurseId) {
            return res.status(400).json({
                success: false,
                message: "Nurse ID is required to fetch your bookings."
            });
        }

        // Find jobs where assignedNurse matches this nurse AND the status is 'Accepted'
        const myJobs = await Appointment.find({
            assignedNurse: nurseId,
            status: 'Accepted'
        }).sort({ createdAt: -1 }); // Newest bookings first

        return res.status(200).json({
            success: true,
            count: myJobs.length,
            data: myJobs
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error fetching nurse's booked appointments.",
            error: error.message
        });
    }
};

 

// 1. GET: Fetch complete profile details for a nurse
export const getNurseProfile = async (req, res) => {
    try {
        const { nurseId } = req.query; // In production, handle via auth middleware token

        if (!nurseId) {
            return res.status(400).json({ success: false, message: "Nurse ID is required." });
        }

        const nurse = await modelNurse.findById(nurseId).select('-password'); // Exclude sensitive password string
        
        if (!nurse) {
            return res.status(404).json({ success: false, message: "Nurse profile not found." });
        }

        return res.status(200).json({
            success: true,
            data: nurse
        });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

// 2. PUT: Update specific Nurse profile properties (Form details, Hourly Fee, Availability)
export const updateNurseProfile = async (req, res) => {
    try {
        const { nurseId, hourlyFee, availability, hospitalName, specialization, description } = req.body;

        if (!nurseId) {
            return res.status(400).json({ success: false, message: "Nurse ID is required for updating details." });
        }

        // Prepare an object containing only the fields sent in the request body
        const updateFields = {};
        if (hourlyFee !== undefined) updateFields.hourlyFee = hourlyFee;
        if (hospitalName !== undefined) updateFields.hospitalName = hospitalName;
        if (specialization !== undefined) updateFields.specialization = specialization;
        if (description !== undefined) updateFields.description = description;

        // ⚡ Handle the nested availability object (days, from, to) smoothly
        if (availability !== undefined) {
            if (availability.days !== undefined) updateFields['availability.days'] = availability.days;
            if (availability.from !== undefined) updateFields['availability.from'] = availability.from;
            if (availability.to !== undefined) updateFields['availability.to'] = availability.to;
        }

        const updatedNurse = await modelNurse.findByIdAndUpdate(
            nurseId,
            { $set: updateFields },
            { new: true, runValidators: true } // Return fresh updated document and respect constraints
        ).select('-password');

        if (!updatedNurse) {
            return res.status(404).json({ success: false, message: "Nurse not found." });
        }

        return res.status(200).json({
            success: true,
            message: "Profile settings updated successfully!",
            data: updatedNurse
        });

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};


// This function supplies the data for the "Upcoming Appointments" section on the Profile Screen
export const getMyAppointments = async (req, res) => {
    try {
        // 1. Grab both nurseId and tab from query parameters
        const { nurseId, tab } = req.query; 

        if (!nurseId) {
            return res.status(400).json({
                success: false,
                message: "Nurse ID is required to fetch appointments."
            });
        }

        // 2. Start with the default nurse filter
        let filter = { assignedNurse: nurseId };

        // 3. Dynamically alter the filter based on the active UI tab state
        if (tab === 'past') {
            // Screen "Past" tab handles history records
            filter.status = { $in: ['Completed', 'Cancelled'] };
        } else {
            // Default to 'upcoming' tab if no tab parameter is sent
            filter.status = { $in: ['Pending', 'Accepted'] };
        }

        // 4. Fetch from MongoDB and sort by the actual event execution date
        const appointments = await Appointment.find(filter).sort({ appointmentDate: 1 }); 

        return res.status(200).json({
            success: true,
            count: appointments.length,
            data: appointments
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error fetching nurse profile appointments.",
            error: error.message
        });
    }
};


export const cancelAppointmentByNurse = async (req, res) => {
    try {
        const { appointmentId, reason, details } = req.body;

        if (!appointmentId || !reason) {
            return res.status(400).json({ success: false, message: "Appointment ID and reason are required." });
        }

        // Find the target booking target record
        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) {
            return res.status(404).json({ success: false, message: "Appointment record not found." });
        }

        // Check the 1-hour cancellation rule from Screen 59
        const appointmentTime = new Date(appointment.appointmentDate); // Ensure your schema records date/time properly
        const currentTime = new Date();
        const timeDifferenceInMs = appointmentTime - currentTime;
        const timeDifferenceInHours = timeDifferenceInMs / (1000 * 60 * 60);

        // If the appointment starts in less than 1 hour, block cancellation immediately
        if (timeDifferenceInHours < 1 && timeDifferenceInHours > 0) {
            return res.status(400).json({
                success: false,
                code: "CANCELLATION_BLOCKED",
                message: "Cancellations cannot be made within an hour of your scheduled appointment."
            });
        }

        // Apply cancellation changes
        appointment.status = 'Cancelled';
        appointment.cancellation = {
            cancelledBy: 'Nurse',
            reason: reason,
            details: details || "",
            cancelledAt: new Date()
        };

        await appointment.save();

        return res.status(200).json({
            success: true,
            message: "Appointment Cancelled successfully.",
            data: appointment
        });

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};