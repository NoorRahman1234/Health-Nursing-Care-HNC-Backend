// import express from 'express';
// import mongoose from 'mongoose';
// import cors from 'cors';
// import dotenv from 'dotenv';
// import  connectDB from './config/db.js';
// import path from 'path';
// import authRoutes from './routes/authRoutes.js'; 
// import dashboardRoutes from './routes/dashboardRoutes.js'


// // Initialize the express framework server application
// const app = express();

// // Load enviroment variable (.env)
// dotenv.config();


// // connection Mongodb Atlas
//  connectDB();

// // Middleware
// app.use(cors()); // this allow frontend to communicate with this backend
// app.use(express.json()); // this allow the server to accept the JSON data in the request body


// // Set up Route url paths
// app.use('/api/auth', authRoutes);
// app.use('/api/dashboard', dashboardRoutes);



// // Database connection
// const PORT = process.env.PORT || 9032;
// const MONGO_URI = process.env.MONGO_URI;

//  app.listen(PORT, () => {
//   console.log(`Server is runnig on: ${PORT}`);
// });





import express from 'express';
import { createServer } from 'http'; // ⚡ Added for Socket.io
import { Server } from 'socket.io';   // ⚡ Added for Socket.io
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js'; 
import dashboardRoutes from './routes/dashboardRoutes.js';

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

// Socket.io connection logic
io.on('connection', (socket) => {
  console.log(`⚡ A user connected: ${socket.id}`);

  // When a patient logs into their app, they join their own private room
  socket.on('join_room', (userId) => {
    socket.join(userId);
    console.log(`👤 User joined private room: ${userId}`);
  });

  socket.on('disconnect', () => {
    console.log('❌ User disconnected');
  });
});

// Set up Route url paths
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Define PORT from env or fallback
const PORT = process.env.PORT || 9032;

// Connect to MongoDB Atlas and then start the server
connectDB().then(() => {
  // ⚡ CRITICAL: We use httpServer.listen here instead of app.listen so sockets work!
  httpServer.listen(PORT, () => {
    console.log(`🚀 Server and WebSockets running on port: ${PORT}`);
  });
}).catch((error) => {
  console.log("Database connection failed, server not started.", error.message);
});