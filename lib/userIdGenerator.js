const prisma = require('./prisma');

/**
 * Generates the next unique userId in the format: bock1, bock2, bock3, ...
 * Finds the current highest number and increments by 1.
 */
async function generateUniqueUserId() {
  // Find the highest existing bock number
  const users = await prisma.user.findMany({
    where: {
      userId: {
        startsWith: 'bock',
        not: null,
      },
    },
    select: { userId: true },
  });

  let maxNum = 0;
  for (const user of users) {
    const numPart = parseInt(user.userId.replace('bock', ''), 10);
    if (!isNaN(numPart) && numPart > maxNum) {
      maxNum = numPart;
    }
  }

  const nextNum = maxNum + 1;
  const nextId = `bock${nextNum}`;

  // Double-check uniqueness (safety net)
  const exists = await prisma.user.findFirst({
    where: { userId: nextId },
  });

  if (exists) {
    // Extremely unlikely race condition — retry recursively
    return generateUniqueUserId();
  }

  return nextId;
}

/**
 * Generates userId values for all existing users that don't have one.
 * Returns an array of { id, email, username, userId } for logging.
 */
async function migrateExistingUsers() {
  const usersWithoutId = await prisma.user.findMany({
    where: {
      OR: [
        { userId: null },
        { userId: '' },
      ],
    },
    select: { id: true, email: true, username: true },
    orderBy: { id: 'asc' },
  });

  if (usersWithoutId.length === 0) {
    return [];
  }

  const results = [];

  for (const user of usersWithoutId) {
    const userId = await generateUniqueUserId();
    await prisma.user.update({
      where: { id: user.id },
      data: { userId },
    });
    results.push({
      id: user.id,
      email: user.email,
      username: user.username,
      userId,
    });
  }

  return results;
}

module.exports = { generateUniqueUserId, migrateExistingUsers };
