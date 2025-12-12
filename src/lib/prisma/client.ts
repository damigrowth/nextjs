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
    log: [
      { emit: 'event', level: 'query' },
      { emit: 'event', level: 'error' },
      { emit: 'event', level: 'info' },
      { emit: 'event', level: 'warn' },
    ],
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

// Filter out session deletion errors from logs
// These are expected during user deletion when Better Auth cleans up sessions
prisma.$on('error', (e) => {
  // Suppress session deletion errors - these occur when getSession() tries to sign out
  // a deleted user whose sessions were already removed by Better Auth's deleteUser
  if (e.target !== 'session.delete') {
    console.error('Prisma error:', e);
  }
  // Session deletion errors are silently ignored as they're expected during account deletion
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Graceful shutdown - close connections when process terminates
if (process.env.NODE_ENV === 'production') {
  process.on('beforeExit', async () => {
    await prisma.$disconnect();
  });
}


