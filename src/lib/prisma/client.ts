/**
 * Prisma Client Singleton
 * Ensures single instance across the application to prevent connection issues
 * Includes connection pool configuration for Supabase/Neon
 */

import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    errorFormat: 'pretty',
    // Connection pool configuration optimized for serverless (Vercel)
    // NOTE: To reduce connection pool, add to your DATABASE_URL:
    // ?connection_limit=3&pool_timeout=20
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Graceful shutdown - close connections when process terminates
if (process.env.NODE_ENV === 'production') {
  process.on('beforeExit', async () => {
    await prisma.$disconnect();
  });
}


