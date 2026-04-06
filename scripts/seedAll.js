const { PrismaClient, SizeType } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { categoriesData, productData } = require('../seedData');
require('dotenv').config();

const prisma = new PrismaClient();

const SIZE_CONFIGS = {
  GENERIC: {
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    stocks: [5, 12, 20, 18, 10, 4],
  },
  SHOES_UK_MEN: {
    sizes: ['6', '7', '8', '9', '10', '11'],
    stocks: [4, 8, 15, 15, 10, 5],
  },
  SHOES_UK_WOMEN: {
    sizes: ['3', '4', '5', '6', '7', '8'],
    stocks: [4, 8, 15, 15, 10, 5],
  },
  WAIST_INCH: {
    sizes: ['28', '30', '32', '34', '36', '38'],
    stocks: [5, 10, 18, 16, 8, 3],
  },
  VOLUME_ML: {
    sizes: ['30ml', '50ml', '100ml', '200ml'],
    stocks: [20, 30, 25, 15],
  },
  WEIGHT_G: {
    sizes: ['250g', '500g', '1kg'],
    stocks: [15, 25, 10],
  },
  NUMERIC: {
    sizes: ['S', 'M', 'L'],
    stocks: [10, 15, 8],
  },
  ONE_SIZE: {
    sizes: ['One Size'],
    stocks: [30],
  },
};

const isStrongAdminPassword = (password) => {
  if (typeof password !== 'string') return false;
  if (password.length < 12) return false;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  return hasUppercase && hasLowercase && hasNumber && hasSpecial;
};

const resolveAdminPassword = () => {
  const envPassword = process.env.ADMIN_PASSWORD;
  if (envPassword) {
    if (!isStrongAdminPassword(envPassword)) {
      throw new Error(
        'ADMIN_PASSWORD must be at least 12 characters and include upper, lower, number, and special characters.'
      );
    }
    return { password: envPassword, generated: false };
  }

  // Development fallback: generate one-time strong password when ADMIN_PASSWORD is not provided.
  const generatedBase = crypto.randomBytes(18).toString('base64url');
  const generatedPassword = `${generatedBase}Aa1!`;
  return { password: generatedPassword, generated: true };
};

async function seedAdminUser() {
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@nexus.local').trim().toLowerCase();
  const adminUsername = (process.env.ADMIN_USERNAME || 'admin').trim();

  if (!adminEmail || !adminUsername) {
    throw new Error('ADMIN_EMAIL and ADMIN_USERNAME must be non-empty values.');
  }

  const existingByEmail = await prisma.user.findUnique({
    where: { email: adminEmail },
    select: { id: true, email: true, username: true, role: true },
  });

  const existingByUsername = await prisma.user.findUnique({
    where: { username: adminUsername },
    select: { id: true, email: true, username: true, role: true },
  });

  const emailTakenByDifferentUser =
    existingByEmail && existingByEmail.role !== 'ADMIN';
  const usernameTakenByDifferentUser =
    existingByUsername &&
    existingByUsername.role !== 'ADMIN' &&
    (!existingByEmail || existingByUsername.id !== existingByEmail.id);

  if (emailTakenByDifferentUser || usernameTakenByDifferentUser) {
    throw new Error(
      'Cannot seed admin account because ADMIN_EMAIL or ADMIN_USERNAME is already used by a non-admin user.'
    );
  }

  const { password, generated } = resolveAdminPassword();
  const passwordHash = await bcrypt.hash(password, 12);

  const existingAdmin = existingByEmail || existingByUsername;

  if (existingAdmin) {
    const updateData = {
      role: 'ADMIN',
    };

    if (process.env.ADMIN_PASSWORD) {
      updateData.password = passwordHash;
    }

    await prisma.user.update({
      where: { id: existingAdmin.id },
      data: updateData,
    });

    console.log(`   Admin user ensured: ${existingAdmin.email} (${existingAdmin.username})`);
    if (!process.env.ADMIN_PASSWORD) {
      console.log('   ADMIN_PASSWORD not provided. Existing admin password was left unchanged.');
    }
    return;
  }

  await prisma.user.create({
    data: {
      email: adminEmail,
      username: adminUsername,
      password: passwordHash,
      role: 'ADMIN',
      firstName: process.env.ADMIN_FIRST_NAME || 'Admin',
      lastName: process.env.ADMIN_LAST_NAME || 'User',
    },
  });

  console.log(`   Admin user created: ${adminEmail} (${adminUsername})`);
  if (generated) {
    console.log(`   Generated ADMIN password (set ADMIN_PASSWORD to override): ${password}`);
  }
}

async function seedDatabase() {
  try {
    console.log('🚀 Starting complete database seeding...\n');

    // ── Step 1: Upsert categories ────────────────────────────────
    console.log('📂 Seeding categories...');
    for (const cat of categoriesData) {
      await prisma.category.upsert({
        where: { name: cat.name },
        update: { image_uri: cat.image_uri },
        create: { name: cat.name, image_uri: cat.image_uri },
      });
    }
    const allCategories = await prisma.category.findMany();
    const categoryMap = {};
    for (const c of allCategories) categoryMap[c.name] = c.id;
    console.log(`   ✅ ${allCategories.length} categories ready\n`);

    // ── Step 2: Upsert products with sizes ───────────────────────
    console.log('📦 Seeding products...');
    let created = 0;
    let updated = 0;

    for (const p of productData) {
      const catId = categoryMap[p.category];
      if (!catId) {
        console.warn(`   ⚠️  Category "${p.category}" not found, skipping "${p.name}"`);
        continue;
      }

      const sizeType = p.sizeType || 'NONE';

      const existing = await prisma.product.findFirst({
        where: { name: p.name, categoryId: catId },
      });

      let product;
      const data = {
        name: p.name,
        image_uri: p.image_uri,
        price: p.price,
        ar_uri: p.ar_uri || null,
        description: p.description || '',
        categoryId: catId,
        sizeType,
        color: p.color || null,
        brand: p.brand || null,
      };

      if (existing) {
        product = await prisma.product.update({
          where: { id: existing.id },
          data,
        });
        updated++;
      } else {
        product = await prisma.product.create({ data });
        created++;
      }

      // Create product sizes if the sizeType has a config
      const sizeConfig = SIZE_CONFIGS[sizeType];
      if (sizeConfig) {
        for (let i = 0; i < sizeConfig.sizes.length; i++) {
          await prisma.productSize.upsert({
            where: {
              productId_size: {
                productId: product.id,
                size: sizeConfig.sizes[i],
              },
            },
            update: { stock: sizeConfig.stocks[i], sortOrder: i },
            create: {
              productId: product.id,
              size: sizeConfig.sizes[i],
              stock: sizeConfig.stocks[i],
              sortOrder: i,
            },
          });
        }
      }
    }
    console.log(`   ✅ ${created} created, ${updated} updated (${productData.length} total)\n`);

    // ── Step 3: Add sample reviews ───────────────────────────────
    console.log('⭐ Seeding sample reviews...');
    const users = await prisma.user.findMany({ take: 1 });
    if (users.length > 0) {
      const userId = users[0].id;
      const products = await prisma.product.findMany({ take: 10 });
      const reviewTexts = [
        { rating: 5, comment: 'Excellent quality! Highly recommended.' },
        { rating: 4, comment: 'Great value for money. Very satisfied.' },
        { rating: 5, comment: 'Exactly as described. Fast delivery too!' },
        { rating: 3, comment: 'Decent product, does the job.' },
        { rating: 4, comment: 'Good quality, would buy again.' },
      ];

      let reviewCount = 0;
      for (const prod of products) {
        const reviewData = reviewTexts[reviewCount % reviewTexts.length];
        const exists = await prisma.review.findFirst({
          where: { userId, productId: prod.id },
        });
        if (!exists) {
          await prisma.review.create({
            data: { ...reviewData, userId, productId: prod.id },
          });
          reviewCount++;
        }
      }
      console.log(`   ✅ ${reviewCount} reviews added\n`);
    } else {
      console.log('   ⏭️  No users found, skipping reviews\n');
    }
    // Step 4: Ensure at least one admin account exists
    console.log('Seeding admin user...');
    await seedAdminUser();
    console.log('   Admin user ready\n');

    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Seeding error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedDatabase();

