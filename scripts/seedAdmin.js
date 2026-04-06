const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const prisma = new PrismaClient();

async function seedAdmin() {
  const password = 'Admin@12345!x';
  const hash = await bcrypt.hash(password, 12);

  const user = await prisma.user.upsert({
    where: { email: 'admin@nexus.local' },
    update: { role: 'ADMIN', password: hash },
    create: {
      email: 'admin@nexus.local',
      username: 'admin',
      password: hash,
      role: 'ADMIN',
      firstName: 'Admin',
      lastName: 'User',
    },
  });

  console.log('Admin seeded successfully!');
  console.log('  Email:', user.email);
  console.log('  Username:', user.username);
  console.log('  Role:', user.role);
  console.log('  Password: Admin@12345!x');
  await prisma.$disconnect();
}

seedAdmin().catch((e) => {
  console.error('Seed error:', e);
  prisma.$disconnect();
  process.exit(1);
});
