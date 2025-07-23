/**
 * Database utilities
 * Helper functions for database operations and error handling
 */

import { prisma } from '../../../prisma/client.ts';
import { Prisma } from '@prisma/client';
import { AppError } from '@/lib/errors';

// Define a generic type for the result of database operations
interface QueryResult<T> {
  success: boolean;
  data: T | null;
  error?: AppError;
}

// Define a type for Prisma errors
interface PrismaError extends Error {
  code?: string;
}

/**
 * Test database connection
 * @returns {Promise<boolean>} True if connected, false if failed
 */
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$connect();
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error: any) {
    console.error('Database connection failed:', error);
    return false;
  }
}

/**
 * Execute a database query with error handling
 * @param {Function} queryFn - Function that returns a Prisma query
 * @param {string} operation - Description of the operation for logging
 * @returns {Promise<QueryResult<T>>} Result object with success, data, and error
 */
export async function executeQuery<T>(
  queryFn: () => Promise<T>,
  operation: string = 'Database operation',
): Promise<QueryResult<T>> {
  try {
    const data = await queryFn();
    return {
      success: true,
      data,
    };
  } catch (error: any) {
    console.error(`${operation} failed:`, error);
    
    // Convert Prisma errors to AppError
    const appError = AppError.fromPrismaError(error);
    
    return {
      success: false,
      data: null,
      error: appError,
    };
  }
}

/**
 * Execute multiple queries in a transaction
 * @param {Array<Function>} queries - Array of query functions
 * @param {string} operation - Description of the transaction
 * @returns {Promise<QueryResult<T[]>>} Result object with success, data, and error
 */
export async function executeTransaction<T>(
  queries: (() => Prisma.PrismaPromise<T>)[],
  operation: string = 'Transaction',
): Promise<QueryResult<T[]>> {
  try {
    const results = await prisma.$transaction(queries.map((q) => q()));
    return {
      success: true,
      data: results,
    };
  } catch (error: any) {
    console.error(`${operation} transaction failed:`, error);
    
    const appError = AppError.fromPrismaError(error);
    
    return {
      success: false,
      data: null,
      error: appError,
    };
  }
}

/**
 * Get database statistics
 * @returns {Promise<QueryResult<any>>} Database statistics
 */
export async function getDatabaseStats(): Promise<QueryResult<any>> {
  return executeQuery(
    () => prisma.$queryRaw`
      SELECT 
        schemaname,
        tablename,
        attname,
        n_distinct,
        correlation
      FROM pg_stats 
      WHERE schemaname = 'public'
      LIMIT 10
    `,
    'Get database statistics',
  );
}

/**
 * Health check for database
 * @returns {Promise<Object>} Health status
 */
export async function healthCheck(): Promise<{
  status: string;
  responseTime?: string;
  timestamp: string;
  connection: string;
  error?: string;
}> {
  try {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const responseTime = Date.now() - start;

    return {
      status: 'healthy',
      responseTime: `${responseTime}ms`,
      timestamp: new Date().toISOString(),
      connection: 'active',
    };
  } catch (error: any) {
    return {
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString(),
      connection: 'failed',
    };
  }
}

/**
 * Soft delete helper
 * @param {string} model - Prisma model name
 * @param {string} id - Record ID
 * @returns {Promise<QueryResult<any>>} Result object
 */
export async function softDelete(
  model: string,
  id: string,
): Promise<QueryResult<any>> {
  return executeQuery(
    () =>
      (prisma as any)[model].update({
        where: { id },
        data: {
          deletedAt: new Date(),
          isActive: false,
        },
      }),
    `Soft delete ${model}`,
  );
}

/**
 * Restore soft deleted record
 * @param {string} model - Prisma model name
 * @param {string} id - Record ID
 * @returns {Promise<QueryResult<any>>} Result object
 */
export async function restoreDeleted(
  model: string,
  id: string,
): Promise<QueryResult<any>> {
  return executeQuery(
    () =>
      (prisma as any)[model].update({
        where: { id },
        data: {
          deletedAt: null,
          isActive: true,
        },
      }),
    `Restore ${model}`,
  );
}

interface PaginatedOptions {
  page?: number;
  limit?: number;
  where?: any; // This can be more specific based on Prisma's WhereInput types
  select?: any; // This can be more specific based on Prisma's Select types
  include?: any; // This can be more specific based on Prisma's Include types
  orderBy?: any; // This can be more specific based on Prisma's OrderBy types
}

interface PaginatedResult<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  error?: AppError;
}

/**
 * Paginated query helper
 * @param {string} model - Prisma model name
 * @param {Object} options - Query options
 * @returns {Promise<PaginatedResult<T>>} Paginated result
 */
export async function paginatedQuery<T>(
  model: string,
  options: PaginatedOptions = {},
): Promise<PaginatedResult<T>> {
  const {
    page = 1,
    limit = 10,
    where = {},
    select = undefined,
    include = undefined,
    orderBy = { createdAt: 'desc' },
  } = options;

  const offset = (page - 1) * limit;

  try {
    const [data, total] = await Promise.all([
      (prisma as any)[model].findMany({
        where,
        select,
        include,
        orderBy,
        skip: offset,
        take: limit,
      }),
      (prisma as any)[model].count({ where }),
    ]);

    return {
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: offset + limit < total,
        hasPrev: page > 1,
      },
    };
  } catch (error: any) {
    console.error(`Paginated query for ${model} failed:`, error);
    
    const appError = AppError.fromPrismaError(error);
    
    return {
      success: false,
      data: [], // Return empty array for data on error
      error: appError,
      pagination: {
        // Provide default pagination on error
        page: page,
        limit: limit,
        total: 0,
        pages: 0,
        hasNext: false,
        hasPrev: false,
      },
    };
  }
}
