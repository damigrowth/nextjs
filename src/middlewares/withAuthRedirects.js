import { NextResponse } from "next/server";

export const withAuthRedirects = (next) => {
  return async (request, _next) => {
    const currentPath = request.nextUrl.pathname;
    const authenticated = request.auth?.authenticated || false;
    
    const isLoginPage = currentPath === '/login';
    const isRegisterPage = currentPath === '/register';

    if (isLoginPage && authenticated) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    if (isRegisterPage && authenticated) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return next(request, _next);
  };
};
