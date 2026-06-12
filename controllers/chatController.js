
import Chat from '../models/chatModel.js';

// @desc    Get all chat threads for a specific logged-in Nurse
// @route   GET /api/chat/threads
export const getNurseThreads = async (req, res) => {
    try {
        // Replace with req.user._id once your auth middleware is applied
        const { nurseId } = req.query; 

        const threads = await Chat.find({ nurseId })
            .populate('patientId', 'name profilePicture') // Grabs patient info for the list UI
            .sort({ updatedAt: -1 }); // Newest conversations at the top

        res.status(200).json({ success: true, data: threads });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Save a new text message to the database (Used by Socket.io)
export const saveMessage = async (nurseId, patientId, senderId, senderModel, text) => {
    try {
        // Find existing room or create a new one if it doesn't exist
        let chatRoom = await Chat.findOne({ nurseId, patientId });

        if (!chatRoom) {
            chatRoom = new Chat({ nurseId, patientId, messages: [] });
        }

        const newMessage = { senderId, senderModel, text };
        chatRoom.messages.push(newMessage);
        chatRoom.lastMessage = text;

        await chatRoom.save();
        return chatRoom.messages[chatRoom.messages.length - 1]; // Return the saved message with its ID
    } catch (error) {
        console.error("Error saving message to DB:", error.message);
        return null;
    }
};

// @desc    Delete or clear an entire chat conversation thread (Swipe to Delete from video)
// @route   DELETE /api/chat/thread/:roomId
export const deleteChatThread = async (req, res) => {
    try {
        const { roomId } = req.params;

        const deletedChat = await Chat.findByIdAndDelete(roomId);

        if (!deletedChat) {
            return res.status(404).json({ 
                success: false, 
                message: "Chat thread room not found." 
            });
        }

        res.status(200).json({ 
            success: true, 
            message: "Conversation thread deleted successfully." 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};