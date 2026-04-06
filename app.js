const express = require('express');
require('dotenv').config();
const prisma = require('./lib/prisma');
const userRoutes = require('./routes/userRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const cartRoutes = require('./routes/cartRoutes');
const addressRoutes = require('./routes/addressRoutes'); 
const checkoutRoutes = require('./routes/checkoutRoutes')
const reviewRoutes = require('./routes/reviewRoutes')
const wishlistRoutes = require('./routes/wishlistRoutes');
const adminRoutes = require('./routes/adminRoutes');
const { authenticateToken, requireAdmin } = require('./middleware/auth');
const { adminRateLimiter } = require('./middleware/rateLimit');
const { enforceHttpsInProduction } = require('./middleware/security');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const { generateUniqueUserId, migrateExistingUsers } = require('./lib/userIdGenerator');

const app = express();
const port = process.env.PORT || 3000;

async function ensureDefaultAdmin() {
  const defaultEmail = 'asd@gmail.com';
  const defaultPassword = '1234567';
  const defaultUsernameBase = 'asd';

  const existingByEmail = await prisma.user.findFirst({
    where: { email: defaultEmail },
    select: { id: true, username: true, role: true, userId: true },
  });

  const passwordHash = await bcrypt.hash(defaultPassword, 10);

  // If the default email already exists, upgrade that user to ADMIN (idempotent).
  if (existingByEmail) {
    const updateData = {
      role: 'ADMIN',
      password: passwordHash,
    };

    // Hard-code admin userId to "admin001"
    if (!existingByEmail.userId || existingByEmail.userId !== 'admin001') {
      updateData.userId = 'admin001';
    }

    await prisma.user.update({
      where: { id: existingByEmail.id },
      data: updateData,
    });

    const adminUserId = updateData.userId || existingByEmail.userId;
    console.log(`   ✅ Default admin ensured: ${defaultEmail}`);
    console.log(`   🔑 Admin User ID: ${adminUserId} (password: ${defaultPassword})`);
    return;
  }

  // If a user with the default email doesn't exist, only create the default admin
  // when there are currently *no* admins at all.
  const existingAdmin = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
    select: { id: true, userId: true },
  });
  if (existingAdmin) {
    console.log(`   ✅ Admin already exists with User ID: ${existingAdmin.userId}`);
    return;
  }

  // Otherwise create a new default admin with a unique userId.
  const adminUserId = 'admin001';

  let username = defaultUsernameBase;
  for (let attempt = 0; attempt < 5; attempt++) {
    const taken = await prisma.user.findFirst({
      where: { username },
      select: { id: true },
    });
    if (!taken) break;
    username = `${defaultUsernameBase}_admin_${Math.floor(Math.random() * 10000)}`;
  }

  await prisma.user.create({
    data: {
      userId: adminUserId,
      email: defaultEmail,
      username,
      password: passwordHash,
      role: 'ADMIN',
      firstName: 'Admin',
      lastName: 'User',
    },
  });

  console.log(`   ✅ Default admin created: ${defaultEmail} (username: ${username})`);
  console.log(`   🔑 Admin User ID: ${adminUserId} (password: ${defaultPassword})`);
}

/**
 * Generates userId for all existing users that don't have one yet.
 * Prints a table of all generated IDs.
 */
async function migrateExistingUsersOnStartup() {
  const migrated = await migrateExistingUsers();
  
  if (migrated.length === 0) {
    console.log('   ✅ All users already have a userId.');
    return;
  }

  console.log(`\n   📋 Generated userId for ${migrated.length} existing user(s):`);
  console.log('   ┌──────┬──────────────┬──────────────────────────┬──────────────┐');
  console.log('   │  ID  │   User ID    │          Email           │   Username   │');
  console.log('   ├──────┼──────────────┼──────────────────────────┼──────────────┤');
  for (const u of migrated) {
    const id = String(u.id).padEnd(4);
    const uid = (u.userId || '').padEnd(12);
    const email = (u.email || 'N/A').padEnd(24);
    const uname = (u.username || 'N/A').padEnd(12);
    console.log(`   │ ${id} │ ${uid} │ ${email} │ ${uname} │`);
  }
  console.log('   └──────┴──────────────┴──────────────────────────┴──────────────┘\n');
}

if (process.env.TRUST_PROXY === 'true') {
  app.set('trust proxy', 1);
} else if (process.env.TRUST_PROXY) {
  app.set('trust proxy', process.env.TRUST_PROXY);
}

// Middleware
app.use(cors({
  origin: true, // Allow all origins
  credentials: true, // Allow credentials
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(enforceHttpsInProduction);
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

// Admin API routes for React Admin
app.use('/admin', authenticateToken, requireAdmin, adminRateLimiter, adminRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(port, '0.0.0.0', async () => { 
  console.log(`Server running on port ${port}`);
  console.log(`Admin API endpoints available at http://localhost:${port}/admin`);
  
  const MAX_CONNECT_RETRIES = 3;
  for (let i = 1; i <= MAX_CONNECT_RETRIES; i++) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      console.log('✅ DATABASE CONNECTED SUCCESSFULLY to Neon PostgreSQL!');
      
      // Migrate existing users first (generate userId for those without one)
      await migrateExistingUsersOnStartup();
      
      // Then ensure admin exists
      await ensureDefaultAdmin();
      return;
    } catch (error) {
      console.warn(`⚠️  DB connection attempt ${i}/${MAX_CONNECT_RETRIES} failed: ${error.message}`);
      if (i < MAX_CONNECT_RETRIES) {
        await new Promise((r) => setTimeout(r, 2000 * i));
      }
    }
  }
  console.error('❌ Could not connect to database after retries. Server will attempt reconnection on first query.');
});
