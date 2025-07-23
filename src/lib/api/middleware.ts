/**
 * Hono middleware collection
 * Custom middleware for API routes with Better Auth integration
 */

import { cors } from 'hono/cors';
import { requestId } from 'hono/request-id';
import { secureHeaders } from 'hono/secure-headers';
import { Context, Next } from 'hono';
import { ZodError, ZodSchema } from 'zod';
import { auth } from '@/lib/auth';
import { AppError } from '@/lib/errors';
import { AuthUser, AuthSession } from '@/types/auth';

// Extend Hono Context to include user and session from centralized types
declare module 'hono' {
  interface ContextVariableMap {
    user: AuthUser | null;
    session: AuthSession | null;
    validatedBody?: any;
    validatedQuery?: any;
    validatedParams?: any;
    apiVersion?: string;
  }
}

/**
 * CORS middleware configuration
 */
export const corsMiddleware = cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://your-domain.com', // Replace with your production domain
    ...(process.env.ALLOWED_ORIGINS?.split(',') || []),
  ],
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: [
    'Content-Type',
    'Authorization',
    'Accept',
    'Origin',
    'User-Agent',
    'DNT',
    'Cache-Control',
    'X-Mx-ReqToken',
    'Keep-Alive',
    'X-Requested-With',
    'If-Modified-Since',
    'X-Request-ID',
    'Cookie',
    'Set-Cookie',
  ],
  exposeHeaders: ['X-Request-ID', 'Set-Cookie'],
  credentials: true,
});

/**
 * Custom logger middleware to avoid Hono color dependency issues
 */
export const loggerMiddleware = async (c: Context, next: Next) => {
  const start = Date.now();
  const method = c.req.method;
  const url = c.req.url;
  
  await next();
  
  const duration = Date.now() - start;
  const status = c.res.status;
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`🚀 <-- ${method} ${url}`);
    console.log(`🚀 --> ${method} ${url} ${status} ${duration}ms`);
  }
};

/**
 * Security headers middleware
 */
export const securityMiddleware = secureHeaders({
  contentSecurityPolicy: undefined, // Next.js handles CSP
  referrerPolicy: 'strict-origin-when-cross-origin',
});

export { handleApiError, withErrorHandling } from '@/lib/api/error-handler';

/**
 * Request validation middleware
 * @param {ZodSchema} schema - Zod validation schema
 * @param {string} source - Data source ('body', 'query', 'params')
 */
export const validateRequest = (
  schema: ZodSchema,
  source: 'body' | 'query' | 'params' = 'body',
) => {
  return async (c: Context, next: Next) => {
    try {
      let data: any;

      switch (source) {
        case 'body':
          data = await c.req.json().catch(() => ({}));
          break;
        case 'query':
          data = {};
          for (const key in c.req.query()) {
            data[key] = c.req.query(key);
          }
          break;
        case 'params':
          data = c.req.param();
          break;
        default:
          throw AppError.internal(`Invalid validation source: ${source}`);
      }

      const validatedData = schema.parse(data);
      c.set(
        `validated${source.charAt(0).toUpperCase() + source.slice(1)}` as
          | 'validatedBody'
          | 'validatedQuery'
          | 'validatedParams',
        validatedData,
      );

      await next();
    } catch (error: any) {
      if (error instanceof ZodError) {
        const formattedErrors = error.issues.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        throw AppError.badRequest('Validation failed', formattedErrors);
      }
      throw error;
    }
  };
};

/**
 * Rate limiting middleware (simple in-memory implementation)
 * For production, use Redis or similar
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export const rateLimit = (
  maxRequests: number = 100,
  windowMs: number = 15 * 60 * 1000,
) => {
  return async (c: Context, next: Next) => {
    const ip =
      c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown';
    const key = `rate_limit:${ip}`;
    const now = Date.now();

    const record = rateLimitStore.get(key) || {
      count: 0,
      resetTime: now + windowMs,
    };

    if (now > record.resetTime) {
      record.count = 1;
      record.resetTime = now + windowMs;
    } else {
      record.count++;
    }

    rateLimitStore.set(key, record);

    if (record.count > maxRequests) {
      throw AppError.tooManyRequests('Too many requests');
    }

    // Set rate limit headers
    c.res.headers.set('X-RateLimit-Limit', maxRequests.toString());
    c.res.headers.set(
      'X-RateLimit-Remaining',
      Math.max(0, maxRequests - record.count).toString(),
    );
    c.res.headers.set('X-RateLimit-Reset', record.resetTime.toString());

    await next();
  };
};

/**
 * Session middleware - populates user and session in context for all routes
 * Following Better Auth + Hono integration pattern
 */
export const sessionMiddleware = async (c: Context, next: Next) => {
  try {
    const session = await auth.api.getSession({
      headers: c.req.raw.headers,
    });

    if (!session || !session.user) {
      c.set('user', null);
      c.set('session', null);
    } else {
      // Cast to our AuthUser type for consistency
      const authUser: AuthUser = session.user as AuthUser;
      
      // Create AuthSession structure
      const authSession: AuthSession = {
        id: session.session.id,
        userId: session.session.userId,
        expiresAt: session.session.expiresAt,
        token: session.session.token,
        createdAt: session.session.createdAt,
        updatedAt: session.session.updatedAt,
        ipAddress: session.session.ipAddress,
        userAgent: session.session.userAgent,
        user: authUser,
      };

      c.set('user', authUser);
      c.set('session', authSession);
    }
  } catch (error) {
    // Don't fail on session errors, just set to null
    c.set('user', null);
    c.set('session', null);
  }

  return next();
};

/**
 * Authentication middleware using Better Auth
 * Requires user to be authenticated
 */
export const requireAuth = async (c: Context, next: Next) => {
  try {
    // Get user from context (set by sessionMiddleware)
    const user = c.get('user');

    if (!user) {
      throw AppError.unauthorized('Authentication required');
    }

    // Check if user is blocked or banned
    if (user.blocked || user.banned) {
      throw AppError.forbidden('Account is blocked or banned');
    }

    await next();
  } catch (error: any) {
    console.error('Auth middleware error:', error);
    throw AppError.unauthorized('Authentication failed', error);
  }
};

/**
 * Optional auth middleware - doesn't fail if no auth
 * Useful for endpoints that work with or without authentication
 * Note: sessionMiddleware already handles this globally
 */
export const optionalAuth = async (c: Context, next: Next) => {
  // sessionMiddleware already populates user/session, so just continue
  await next();
};

/**
 * Admin authorization middleware
 * Requires user to be authenticated and have admin privileges
 */
export const requireAdmin = async (c: Context, next: Next) => {
  try {
    const user = c.get('user');

    if (!user) {
      throw AppError.unauthorized('Authentication required');
    }

    if (user.role !== 'admin') {
      throw AppError.forbidden('Admin privileges required');
    }

    await next();
  } catch (error: any) {
    console.error('Admin auth middleware error:', error);
    throw AppError.forbidden('Authorization failed', error);
  }
};

/**
 * Role-based authorization middleware
 * @param {Array} allowedRoles - Array of user roles that can access the route
 */
export const requireRole = (allowedRoles: string[]) => {
  return async (c: Context, next: Next) => {
    try {
      const user = c.get('user');

      if (!user) {
        throw AppError.unauthorized('Authentication required');
      }

      if (!allowedRoles.includes(user.role)) {
        throw AppError.forbidden('Insufficient privileges');
      }

      await next();
    } catch (error: any) {
      console.error('Role auth middleware error:', error);
      throw AppError.forbidden('Authorization failed', error);
    }
  };
};

/**
 * Email verification middleware
 * Requires user to have verified email
 */
export const requireEmailVerified = async (c: Context, next: Next) => {
  try {
    const user = c.get('user');

    if (!user) {
      throw AppError.unauthorized('Authentication required');
    }

    if (!user.emailVerified) {
      throw AppError.forbidden('Email verification required');
    }

    await next();
  } catch (error: any) {
    console.error('Email verification middleware error:', error);
    throw AppError.forbidden('Verification check failed', error);
  }
};

/**
 * Dashboard step middleware
 * Requires user to have reached dashboard step (completed onboarding)
 */
export const requireDashboardStep = async (c: Context, next: Next) => {
  try {
    const user = c.get('user');

    if (!user) {
      throw AppError.unauthorized('Authentication required');
    }

    if (user.step !== 'DASHBOARD') {
      throw AppError.forbidden('Onboarding must be completed');
    }

    await next();
  } catch (error: any) {
    console.error('Dashboard step middleware error:', error);
    throw AppError.forbidden('Onboarding check failed', error);
  }
};

/**
 * Request ID middleware for tracking
 */
export const requestIdMiddleware = requestId();

/**
 * API versioning middleware
 * @param {string} version - API version (e.g., 'v1', 'v2')
 */
export const apiVersion = (version: string) => {
  return async (c: Context, next: Next) => {
    c.set('apiVersion', version);
    c.res.headers.set('X-API-Version', version);
    await next();
  };
};
