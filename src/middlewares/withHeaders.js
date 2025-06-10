import { NextResponse } from "next/server";

export const withHeaders = (next) => {
  return async (request, _next) => {
    const currentPath = request.nextUrl.pathname;

    // Set up request headers
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-current-path', currentPath);

    // Continue with the request and add headers
    const response = await next(request, _next);
    
    // If next returned a response, just return it
    if (response && response.headers) {
      return response;
    }

    // Otherwise, create a NextResponse.next() with headers
    return NextResponse.next({
      headers: requestHeaders,
      request: {
        headers: requestHeaders,
      },
    });
  };
};
