// require('dotenv').config();
// const express = require('express');
// const cors = require('cors');
// const connectDB = require('./config/db');

// const app = express();

// connectDB();

// app.use(cors());
// app.use(express.json());

// app.get('/', (req, res) => {
//   res.send('Meter Reading API is running');
// });

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import meterRoutes from './routes/meterRoutes.js';
import readingRoutes from './routes/readingRoutes.js';

const app = express();

const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
}));
app.use(express.json());

if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

console.log('Mounting auth routes at /api/auth');
app.use('/api/auth', authRoutes);
console.log('Auth routes mounted.');

console.log('Mounting meter routes at /api/meters');
app.use('/api/meters', meterRoutes);
console.log('Meter routes mounted.');

console.log('Mounting reading routes at /api/readings');
app.use('/api/readings', readingRoutes);
console.log('Reading routes mounted.');

app.get('/', (req, res) => {
  res.send('Meter Reading API is running');
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;