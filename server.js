import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import  connectDB from './config/db.js';
import path from 'path';
// const authRoutes = require('./routes/authRoutes');
// const patientRoutes = require('./routes/patientRoutes');
//  CORRECT (No curly braces for default exports)
import authRoutes from './routes/authRoutes.js'; 
// import otpRoutes from './routes/otpRoutes.js';

// Initialize the express framework server application
const app = express();

// Load enviroment variable (.env)
dotenv.config();


// connection Mongodb Atlas
 connectDB();

// Middleware
app.use(cors()); // this allow frontend to communicate with this backend
app.use(express.json()); // this allow the server to accept the JSON data in the request body


// Set up Route url paths
app.use('/api/auth', authRoutes);
// app.use('/api/patients', patientRoutes);



// Database connection
const PORT = process.env.PORT || 9032;
const MONGO_URI = process.env.MONGO_URI;

 app.listen(PORT, () => {
  console.log(`Server is runnig on: ${PORT}`);
});


