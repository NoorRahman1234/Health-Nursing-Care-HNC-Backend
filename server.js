const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require('./config/db.js');
const path = require('path');
const authRoutes = require('./routes/authRoutes');
// const patientRoutes = require('./routes/patientRoutes');


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

let = app.listen(PORT, () => {
  console.log(`Server is runnig on: ${PORT}`);
});


