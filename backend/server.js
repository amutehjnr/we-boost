// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const { sequelize } = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const orderRoutes = require('./routes/order.routes');
const taskRoutes = require('./routes/task.routes');
const paymentRoutes = require('./routes/payment.routes');
const withdrawalRoutes = require('./routes/withdrawal.routes');
const platformRoutes = require('./routes/platform.routes');

const app = express();

app.set('trust proxy', 1);

// Security middleware
app.use(helmet());
app.use(cors({
  origin: [
      "https://we-boost.vercel.app",
      "http://localhost:3000",
      "https://we-boost-64ej.vercel.app",
    ],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV 
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/withdrawals', withdrawalRoutes);
app.use('/api/platforms', platformRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Database connection and server startup
const PORT = process.env.PORT || 5000;

let dbReady = null;

const initDb = () => {
  if (!dbReady) {
    dbReady = sequelize.authenticate()
      .then(() => console.log('✅ Database connection established successfully.'))
      .then(() => sequelize.sync({ alter: false }))
      .then(() => console.log('✅ Database synced (missing tables created).'))
      .catch((error) => {
        console.error('❌ Database init error:', error);
        dbReady = null;
      });
  }
  return dbReady;
};

initDb();

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  await sequelize.close();
  process.exit(0);
});

module.exports = app;