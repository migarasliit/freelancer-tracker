const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check route
app.get('/', (req, res) => {
  res.json({ message: 'Freelancer Tracker API is running' });
});

// ==================== API ROUTES ====================

// Auth routes
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// Client routes
const clientRoutes = require('./routes/clientRoutes');
app.use('/api/clients', clientRoutes);

// Project routes
const projectRoutes = require('./routes/projectRoutes');
app.use('/api/projects', projectRoutes);

// Income routes
const incomeRoutes = require('./routes/incomeRoutes');
app.use('/api/income', incomeRoutes);

// ==================== ERROR HANDLER ====================
// Handle 404 - Route not found
app.use((req, res, next) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || 'Internal Server Error' });
});

// ==================== START SERVER ====================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));