import { NextResponse, NextRequest } from 'next/server';
import { getSessionCookie } from 'better-auth/cookies';

export const withSimpleAuth = (next: Function) => {
  return async (request: NextRequest, _next: Function) => {
    const currentPath = request.nextUrl.pathname;

    try {
      // Official Better Auth approach: Only check cookie existence for lightweight routing
      const sessionCookie = getSessionCookie(request);
      // console.log('Session cookie exists:', !!sessionCookie);

      // Route type detection
      const isAuthPage = currentPath.startsWith('/auth/');
      const isLoginPage =
        currentPath === '/login' || currentPath === '/auth/signin';
      const isRegisterPage =
        currentPath === '/register' || currentPath === '/auth/signup';
      const isDashboardPath = currentPath.startsWith('/dashboard');
      const isOnboardingPath = currentPath.startsWith('/onboarding');
      const publicPaths = [
        '/',
        '/about',
        '/contact',
        '/privacy',
        '/terms',
        '/faq',
        '/for-pros',
      ];
      const isPublicPath = publicPaths.includes(currentPath);

      // ===========================================
      // UNAUTHENTICATED USER FLOW
      // ===========================================
      if (!sessionCookie) {
        // Allow access to auth pages and public pages
        if (isAuthPage || isLoginPage || isRegisterPage || isPublicPath) {
          return next(request, _next);
        }

        // Protect dashboard and other protected routes
        if (isDashboardPath || isOnboardingPath) {
          // console.log('No session cookie - redirecting to signin');
          return NextResponse.redirect(new URL('/auth/signin', request.url));
        }

        return next(request, _next);
      }

      // ===========================================
      // AUTHENTICATED USER FLOW (Optimistic)
      // ===========================================

      // We have a session cookie, so we assume user is authenticated
      // Full validation and role-based redirects will happen at page level

      // Set basic auth context for compatibility with existing code
      (request as any).auth = {
        hasSessionCookie: true,
        authenticated: true, // Optimistic - full validation at page level
        // All other properties will be validated at page level
        session: null,
        user: null,
        role: null,
        isSimpleUser: false,
        isFreelancer: false,
        isCompany: false,
        isAdmin: false,
        isProfessional: false,
        needsEmailVerification: false,
        needsProfileCompletion: false,
        needsOnboarding: false,
        canAccessDashboard: false, // Conservative - page will validate
      };

      // Allow access to all routes for authenticated users
      // Page-level components will handle:
      // - Role-based access control
      // - Onboarding step validation
      // - Email verification checks
      // - Profile completion checks
      // console.log(
      //   'Session cookie found - allowing access, page will validate details',
      // );

      return next(request, _next);
    } catch (error) {
      console.error('Simple auth middleware error:', error);

      // On error, treat as unauthenticated
      (request as any).auth = {
        hasSessionCookie: false,
        authenticated: false,
        session: null,
        user: null,
        role: null,
        isSimpleUser: false,
        isFreelancer: false,
        isCompany: false,
        isAdmin: false,
        isProfessional: false,
        needsEmailVerification: false,
        needsProfileCompletion: false,
        needsOnboarding: false,
        canAccessDashboard: false,
      };

      return next(request, _next);
    }
  };
};
