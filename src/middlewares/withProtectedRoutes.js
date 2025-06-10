import { NextResponse } from "next/server";

const PROTECTED_PATHS = [
  '/dashboard',
  '/dashboard/create-projects',
  '/dashboard/documents',
  '/dashboard/invoice',
  '/dashboard/manage-jobs',
  '/dashboard/manage-projects',
  '/dashboard/messages',
  '/dashboard/orders',
  '/dashboard/payouts',
  '/dashboard/profile',
  '/dashboard/proposal',
  '/dashboard/reviews',
  '/dashboard/saved',
  '/dashboard/services',
];

export const withProtectedRoutes = (next) => {
  return async (request, _next) => {
    const currentPath = request.nextUrl.pathname;
    const authenticated = request.auth?.authenticated || false;
    const isDashboardPath = currentPath.startsWith('/dashboard');

    // Handle dashboard paths
    if (isDashboardPath && !authenticated) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Handle other protected paths
    if (PROTECTED_PATHS.includes(currentPath) && !authenticated) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    return next(request, _next);
  };
};
