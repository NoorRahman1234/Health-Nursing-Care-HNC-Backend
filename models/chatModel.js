import mongoose from 'mongoose';

// 1. Message Schema (Stores individual text details)
const messageSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'senderModel' // Dynamically references either Nurse or Patient
    },
    senderModel: {
        type: String,
        required: true,
        enum: ['Nurse', 'Patient']
    },
    text: {
        type: String,
        required: true,
        trim: true
    },
    isRead: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

// 2. Chat Room Schema (Represents a thread between a specific Nurse and Patient)
const chatSchema = new mongoose.Schema({
    nurseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Nurse',
        required: true
    },
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient', // Assuming your patient model is named 'Patient'
        required: true
    },
    messages: [messageSchema], // Embeds the message array directly inside the room
    lastMessage: {
        type: String,
        default: ""
    }
}, { timestamps: true });

const Chat = mongoose.model('Chat', chatSchema);
export default Chat;