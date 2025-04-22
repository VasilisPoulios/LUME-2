require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Route files
const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const userRoutes = require('./routes/userRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const adminRoutes = require('./routes/adminRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

// Debug: Log environment variables
console.log('Environment:', process.env.NODE_ENV);
console.log('Stripe Key exists:', !!process.env.STRIPE_SECRET_KEY);

// Create Express app
const app = express();

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS
app.use(cors());

// Static folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);

// Debug route to list all registered routes
app.get('/api/debug/routes', (req, res) => {
  const routes = [];
  
  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      // Routes registered directly on the app
      routes.push({
        path: middleware.route.path,
        methods: Object.keys(middleware.route.methods)
      });
    } else if (middleware.name === 'router') {
      // Routes added via router
      middleware.handle.stack.forEach((handler) => {
        if (handler.route) {
          const path = middleware.regexp.toString()
            .replace('\\^', '')
            .replace('\\/?(?=\\/|$)', '')
            .replace(/\\\//g, '/')
            .replace(/\(\?:\(\[\^\\\/]\+\?\)\)/g, ':$1')
            .replace(/\(\?:\(\[\^\\\/]\+\)\)/g, ':$1')
            .replace(/\\\\/g, '')
            .replace(/\\\?/g, '?')
            .replace(/\\/g, '')
            .replace('(?:/)?$', '')
            .replace('$', '') + (handler.route.path === '/' ? '' : handler.route.path);
          
          routes.push({
            path,
            methods: Object.keys(handler.route.methods)
          });
        }
      });
    }
  });
  
  res.json({
    count: routes.length,
    routes
  });
});

// Routes
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Error middleware
app.use(notFound);
app.use(errorHandler);

// Define port - use 4010 specifically 
const PORT = process.env.PORT || 4010;

// Connect to MongoDB and start server
connectDB().then(() => {
  // Try to start the server on the initial port, then try alternative ports if needed
  const startServer = (port, maxAttempts = 10, attempt = 0) => {
    // Ensure port is a number and within valid range (0-65535)
    port = parseInt(port, 10);
    if (isNaN(port) || port < 0 || port > 65535) {
      console.error(`Invalid port number: ${port}. Using port 4010.`);
      port = 4010;
    }

    if (attempt >= maxAttempts) {
      console.error(`Failed to start server after ${maxAttempts} attempts. Using hard-coded port 4010.`);
      // Last attempt with specific port
      app.listen(4010, () => {
        console.log(`Server FORCED to run on port 4010`);
      }).on('error', (err) => {
        console.error('CRITICAL: Even the fallback port 4010 is unavailable:', err);
        process.exit(1);
      });
      return;
    }

    const server = app.listen(port, () => {
      console.log(`Server running in ${process.env.NODE_ENV} mode on port ${port}`);
    }).on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        // If we've tried everything else, force port 4010+attempt
        if (attempt >= 5) {
          const forcedPort = 4010 + (attempt - 5);
          console.log(`Still having port conflicts. Trying forced port ${forcedPort}...`);
          startServer(forcedPort, maxAttempts, attempt + 1);
          return;
        }
        
        // Calculate next port to try, ensuring it stays in valid range
        const nextPort = port + 1 <= 65535 ? port + 1 : 4010;
        console.log(`Port ${port} is already in use, trying ${nextPort}...`);
        // Try the next port
        startServer(nextPort, maxAttempts, attempt + 1);
      } else {
        console.error('Server failed to start:', err);
      }
    });
  };

  // Start with the port from the environment variable
  startServer(PORT);
}); 