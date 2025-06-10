const express = require('express');
const { PrismaClient } = require('./generated/prisma');
require('dotenv').config();
const userRoutes = require('./routes/userRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;
const prisma = new PrismaClient();

// Middleware
app.use(cors()); // Enable CORS for all origins (customize as needed)
app.use(express.json()); // Middleware to parse JSON

// Health check endpoint
app.get('/', async (req, res) => {
  try {
    const now = await prisma.$queryRaw`SELECT NOW()`;
    res.json({ status: 'ok', time: now[0].now });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API routes
app.use('/user', userRoutes);
app.use('/category', categoryRoutes);
app.use('/product', productRoutes);
app.use('/orders', orderRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(port, '0.0.0.0', () => { 
  console.log(`Server running on port ${port}`);
});