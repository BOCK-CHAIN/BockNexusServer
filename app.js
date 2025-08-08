const express = require('express');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();
const userRoutes = require('./routes/userRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const cartRoutes = require('./routes/cartRoutes');
const addressRoutes = require('./routes/addressRoutes'); 
const checkoutRoutes = require('./routes/checkoutRoutes')
const reviewRoutes = require('./routes/reviewRoutes')
const wishlistRoutes = require('./routes/wishlistRoutes');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// Optimized Prisma client for Neon database
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  // Add connection pooling for better performance
  log: ['query', 'info', 'warn', 'error'],
});

// Middleware
app.use(cors({
  origin: true, // Allow all origins
  credentials: true, // Allow credentials
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
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
app.use('/cart', cartRoutes);
app.use('/address', addressRoutes);
app.use('/review', reviewRoutes)
app.use('/checkout', checkoutRoutes);
app.use('/wishlist', wishlistRoutes);

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