
import express from 'express';
import { createServer } from 'http'; // ⚡ Added for Socket.io
import { Server } from 'socket.io';   // ⚡ Added for Socket.io
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js'; 
import dashboardRoutes from './routes/dashboardRoutes.js';
import settingRoutes from './routes/settingRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import { saveMessage } from './controllers/chatController.js';
import authPatientRoutes from './routes/authPatientRoutes.js';
import patientAppointmentRoutes from './routes/patientAppointmentRoutes.js';
// Load environment variables (.env)
dotenv.config();

// Initialize the express application
const app = express();

// Create HTTP Server by wrapping the Express app
const httpServer = createServer(app); // ⚡ Added for Socket.io

// Initialize Socket.io with CORS handling
const io = new Server(httpServer, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST", "PATCH"]
  }
});

// Attach io to the app object so you can use it inside dashboardController.js
app.set('socketio', io);

// Middleware
app.use(cors()); // Allows frontend to communicate with backend
app.use(express.json()); // Allows the server to accept JSON data in request bodies



// ✅ NEW CODE TO PASTE:
// Socket.io connection logic
io.on('connection', (socket) => {
  console.log(`⚡ A user connected: ${socket.id}`);

  // When a user logs into their app, they join their own private room
  socket.on('join_room', (userId) => {
    socket.join(userId);
    console.log(`👤 User joined private room: ${userId}`);
  });

  // 1. REAL-TIME TEXT MESSAGING (Step 2 in video)
  socket.on('send_message', async (data) => {
    const { nurseId, patientId, senderId, senderModel, text } = data;

    // Save message straight to MongoDB Atlas
    const savedMsg = await saveMessage(nurseId, patientId, senderId, senderModel, text);

    if (savedMsg) {
      // Determine receiver room target
      const targetRoom = senderModel === 'Nurse' ? patientId : nurseId;
      
      // Emit to receiver instantly
      io.to(targetRoom).emit('receive_message', {
        chatRoomId: savedMsg._parent ? savedMsg._parent._id : null,
        message: savedMsg
      });
    }
  });

  // 2. INCOMING VIDEO CALL DIALER (Step 3 in video - Ringing Overlay)
  socket.on('call_user', (data) => {
    const { userToCall, signalData, fromUserId, fromUserName } = data;
    
    // Sends a direct hook payload to the targeted device to trigger the ringing overlay screen
    io.to(userToCall).emit('incoming_call_alert', {
      signal: signalData,
      fromUserId,
      fromUserName
    });
  });

  // 3. CALL RESPONSE: ACCEPT (Step 4 in video)
  socket.on('accept_call', (data) => {
    const { toUserId, signalData } = data;
    
    // Handshakes peer-to-peer streaming channels through WebRTC back to the caller
    io.to(toUserId).emit('call_accepted_handshake', signalData);
  });

  // 4. CALL RESPONSE: DECLINE / BUSY
  socket.on('decline_call', (data) => {
    const { toUserId } = data;
    io.to(toUserId).emit('call_rejected');
  });

  // 5. DISCONNECTING OR ENDING ACTIVE SESSION
  socket.on('end_call', (data) => {
    const { toUserId } = data;
    io.to(toUserId).emit('call_ended_by_peer');
  });

  socket.on('disconnect', () => {
    console.log('❌ User disconnected');
  });
});




// Set up Route url paths
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/setting', settingRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/auth/patient', authPatientRoutes);
app.use('/api/patient-appointments', patientAppointmentRoutes);
// Define PORT from env or fallback
const PORT = process.env.PORT || 9032;

// 1. Start the HTTP & WebSocket server instantly first
httpServer.listen(PORT, () => {
  console.log(`Server and WebSockets running on port: ${PORT}`);
  
  // 2. Connect to MongoDB Atlas in the background second
  connectDB().catch((error) => {
    console.log("❌ Database connection background failure:", error.message);
  });
});