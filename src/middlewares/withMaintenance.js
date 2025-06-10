import { NextResponse } from "next/server";

const MAINTENANCE_PUBLIC_PATHS = [
  '/maintenance',
  '/login',
  '/favicon.ico',
  '/_next',
  '/static',
  '/images',
  '/styles',
  '/scripts',
];

export const withMaintenance = (next) => {
  return async (request, _next) => {
    const isUnderMaintenance = false; // You can make this dynamic
    
    if (!isUnderMaintenance) return next(request, _next);

    const currentPath = request.nextUrl.pathname;
    const authenticated = request.auth?.authenticated || false;
    const isPublicPath = MAINTENANCE_PUBLIC_PATHS.some((path) =>
      currentPath.startsWith(path),
    );

    if (!isPublicPath && !authenticated) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    return next(request, _next);
  };
};
