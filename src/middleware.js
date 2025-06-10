import {
  stackMiddlewares,
  withLowercaseRedirect,
  withAuth,
  withMaintenance,
  withProtectedRoutes,
  withAuthRedirects,
  withOnboarding,
  withHeaders,
} from "./middlewares";

const middlewares = [
  withLowercaseRedirect,    // 1. Normalize URLs first
  withAuth,                 // 2. Get auth data
  withMaintenance,          // 3. Check maintenance mode
  withProtectedRoutes,      // 4. Protect authenticated routes
  withAuthRedirects,        // 5. Handle login/register redirects
  withOnboarding,           // 6. Handle onboarding flow
  withHeaders,              // 7. Set headers (last)
];

export default stackMiddlewares(middlewares);

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
