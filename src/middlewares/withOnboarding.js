import { NextResponse } from "next/server";

export const withOnboarding = (next) => {
  return async (request, _next) => {
    const currentPath = request.nextUrl.pathname;
    const authenticated = request.auth?.authenticated || false;
    const freelancer = request.auth?.freelancer;

    if (!authenticated) return next(request, _next);

    const isDashboardPath = currentPath.startsWith('/dashboard');
    const isOnboardingPath = currentPath.startsWith('/dashboard/start');
    const isSuccessPath = currentPath === '/dashboard/start/success';
    const isActive = freelancer?.isActive;

    // Status 0 (inactive) + tries to access dashboard (except start/success) → redirect to /dashboard/start
    if (isDashboardPath && !isActive && !isOnboardingPath && !isSuccessPath) {
      return NextResponse.redirect(new URL('/dashboard/start', request.url));
    }

    // Status 1 (active) + tries to access /dashboard/start → redirect to /dashboard
    if (isOnboardingPath && isActive && !isSuccessPath) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Handle success page access control
    if (isSuccessPath) {
      const referrer = request.headers.get('referer');
      const allowedReferrer = new URL('/dashboard/start', request.url).toString();

      if (!referrer || !referrer.includes(allowedReferrer)) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }

    return next(request, _next);
  };
};
