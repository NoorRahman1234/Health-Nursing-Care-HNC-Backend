import mongoose from 'mongoose';

// Schema for Support/Contact Messages
const contactSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    message: { type: String, required: true }
}, { timestamps: true });

// Schema for Frequently Asked Questions (FAQs)
const faqSchema = new mongoose.Schema({
    question: { type: String, required: true },
    answer: { type: String, required: true }
});

export const Contact = mongoose.model('Contact', contactSchema);
export const FAQ = mongoose.model('FAQ', faqSchema);