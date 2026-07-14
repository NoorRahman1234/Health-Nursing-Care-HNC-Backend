import { Contact, FAQ } from '../models/modelSetting.js';
import Appointment from '../models/appointmentModel.js'; 

export const submitContactForm = async (req, res) => {
    try {
        const { name, email, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({ success: false, message: "All fields are required." });
        }

        const newContact = new Contact({ name, email, message });
        await newContact.save();

        return res.status(201).json({ success: true, message: "Support ticket submitted successfully!" });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

// 2. GET: Fetch list of FAQs for the help screen
export const getFAQs = async (req, res) => {
    try {
        const faqs = await FAQ.find();
        return res.status(200).json({ success: true, data: faqs });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

// 3. GET: Fetch payment transaction history list for a nurse
export const getTransactionHistory = async (req, res) => {
    try {
        const { nurseId } = req.query;

        if (!nurseId) {
            return res.status(400).json({ success: false, message: "Nurse ID parameter is required." });
        }

        // Find appointments that are either Completed or Cancelled for this nurse
        const history = await Appointment.find({
            assignedNurse: nurseId,
            status: { $in: ['Completed', 'Cancelled'] }
        }).sort({ createdAt: -1 }); 

        return res.status(200).json({
            success: true,
            count: history.length,
            data: history
        });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};