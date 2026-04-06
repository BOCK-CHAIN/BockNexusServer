const { PrismaClient } = require('@prisma/client');

const basePrisma = new PrismaClient({
  log: [
    {
      emit: 'event',
      level: 'error',
    },
  ],
});

// Filter out noisy connection-drop errors (Neon closes idle connections)
basePrisma.$on('error', (e) => {
  const msg = String(e.message ?? '');
  if (
    msg.includes('kind: Closed') ||
    msg.includes('Connection reset') ||
    msg.includes('Error in PostgreSQL connection')
  ) {
    return; // Silently ignore — retry extension handles these
  }
  console.error('[Prisma]', e.message);
});

function isConnectionDrop(error) {
  const msg = (error?.message ?? '') + (error?.toString?.() ?? '');
  return (
    msg.includes('kind: Closed') ||
    msg.includes('Connection reset') ||
    msg.includes('Connection closed') ||
    msg.includes('Error in PostgreSQL connection') ||
    error?.code === 'P2024' ||
    error?.code === 'P1001'
  );
}

const prisma = basePrisma.$extends({
  query: {
    async $allOperations({ args, query }) {
      const MAX_RETRIES = 2;
      let lastError;
      for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        try {
          return await query(args);
        } catch (error) {
          lastError = error;
          if (isConnectionDrop(error) && attempt < MAX_RETRIES) {
            console.warn(`DB connection lost (attempt ${attempt + 1}/${MAX_RETRIES + 1}), retrying…`);
            await new Promise((r) => setTimeout(r, 800 * (attempt + 1)));
            continue;
          }
          throw error;
        }
      }
      throw lastError;
    },
  },
});

module.exports = prisma;
