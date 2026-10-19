
require('dotenv').config();
const express = require("express");
const cors = require('cors');
const helmet = require('helmet');


// Import decoupled route routers
const productRoutes = require('./src/routes/productRoutes');
const authRoutes = require('./src/routes/authRoutes');
const transactionRoutes = require('./src/routes/transactionRoutes');
const errorHandler = require('./src/middleware/errorHandler');
const rateLimit = require('express-rate-limit');
const compression = require('compression');

const app = express();



// Global Middlewares
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: 100, // Limit each IP to 100 requests per window
  message: { error: "Too many requests from this IP. Try again later." }
});

// Apply the limiter to all API routes
app.use(limiter); 


// API Entry Routers
app.use('/products', productRoutes); 
app.use('/auth', authRoutes);
app.use('/transactions', transactionRoutes); // Maps to /transactions endpoint
app.use(compression());

app.use((req, res, next) => {
  res.status(404).json({ 
    error: "NotFoundError", 
    message: `The path '${req.originalUrl}' does not exist on this server.` 
  });
});

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Production server executing on http://localhost:${PORT}`);
});
