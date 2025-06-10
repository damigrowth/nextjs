import { NextResponse } from 'next/server';
import { getTokenFromRequest } from '@/actions/auth/token';
import { getFreelancerActivationStatus } from '@/actions/shared/freelancer';

export const withAuth = (next) => {
  return async (request, _next) => {
    const currentPath = request.nextUrl.pathname;
    const token = await getTokenFromRequest(request);
    const freelancer = await getFreelancerActivationStatus();

    // ENHANCED SECURITY: Check for problematic state: token exists but no freelancer profile
    if (token && !freelancer) {
      console.error(
        'SECURITY_ALERT: Token exists but no freelancer profile found',
        {
          path: currentPath,
          timestamp: Date.now(),
          hasToken: !!token,
          freelancerStatus: freelancer,
          userAgent: request.headers.get('user-agent')?.substring(0, 100),
          ip: request.ip || 'unknown',
        },
      );

      const response = NextResponse.redirect(
        new URL(
          '/login?error=invalid_session&reason=missing_profile',
          request.url,
        ),
      );

      // Clear the invalid token
      response.cookies.set('jwt', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 0,
      });

      console.warn(
        `SECURITY_ACTION: Cleared invalid token for user at ${currentPath}`,
      );
      return response;
    }

    // Store auth data for next middlewares
    request.auth = {
      token,
      freelancer,
      authenticated: Boolean(token && freelancer),
    };

    return next(request, _next);
  };
};
