import { NextResponse } from 'next/server';

import { getFreelancerId, getTokenFromRequest } from '@/actions';

export async function middleware(request) {
  const currentPath = request.nextUrl.pathname;

  const requestHeaders = new Headers(request.headers);

  requestHeaders.set('x-current-path', currentPath);

  const isUnderMaintenance = false;

  const token = getTokenFromRequest(request);

  // console.log("token", token);
  const freelancer = await getFreelancerId(token);

  // Check for the problematic state: token exists but no freelancer profile
  if (token && !freelancer) {
    // Create redirect response with error message
    const response = NextResponse.redirect(
      new URL('/login?error=missing_profile', request.url),
    );

    // Clear the token by setting an expired cookie
    response.cookies.set('jwt', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0, // Expire immediately
    });

    return response;
  }

  const authenticated = Boolean(token && freelancer);

  const maintenancePublicPaths = [
    '/maintenance',
    '/login',
    '/favicon.ico',
    '/_next',
    '/static',
    '/images',
    '/styles',
    '/scripts',
  ];

  const protectedPaths = [
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

  // Check if path starts with /dashboard
  const isDashboardPath = currentPath.startsWith('/dashboard');

  if (isUnderMaintenance) {
    const isPublicPath = maintenancePublicPaths.some((path) =>
      currentPath.startsWith(path),
    );

    if (!isPublicPath && !authenticated) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  } else {
    // Handle dashboard paths
    if (isDashboardPath && !authenticated) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    // Handle other protected paths
    if (protectedPaths.includes(currentPath) && !authenticated) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Handle login page redirect when authenticated
  const isLoginPage = currentPath === '/login';

  const isRegisterPage = currentPath === '/register';

  if (isLoginPage && authenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  if (isRegisterPage && authenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next({
    headers: requestHeaders,
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    {
      source: '/((?!api|_next/static|_next/image|favicon.ico).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'next-action' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};
