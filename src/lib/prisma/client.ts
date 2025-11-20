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
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    // Reduce connection pool size for serverless environments
    // Neon/Supabase pooler typically allows 10-15 concurrent connections
    // Vercel serverless functions should use minimal connections
    __internal: {
      engine: {
        connection_limit: 3, // Reduced from default 10 for serverless
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


