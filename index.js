
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

// Import database connection
const db = require('./db');

const customerRoutes = require('./routes/customers');
const addressRoutes = require('./routes/addresses');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Make database available to all routes
app.use((req, res, next) => {
    req.db = db;
    next();
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev'));

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: 'Connected'
    });
});
app.use(cors({ origin: 'http://localhost:3000' }));
app.get('/', (req, res) => {
  res.send('Customer Management API is running');
});

app.get('/favicon.ico', (req, res) => res.status(204).end());

// API Routes
app.use('/api/customers', customerRoutes);
app.use('/api/addresses', addressRoutes);

// 404 handler
app.use(notFound);


// Error handling
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
