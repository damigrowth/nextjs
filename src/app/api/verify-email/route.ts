import { auth } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Custom email verification route that wraps Better Auth's verify-email endpoint.
 *
 * Better Auth's verifyEmail API throws an APIError with status FOUND (302)
 * for BOTH success and failure — it uses exceptions for redirects.
 *
 * On success: location = callbackURL, session cookies are set.
 * On failure: location contains ?error=token_expired (or similar).
 *
 * We intercept this to redirect failures to /register/failure with the
 * user's email so they can resend the verification email.
 */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  const callbackURL =
    request.nextUrl.searchParams.get('callbackURL') || '/dashboard';

  if (!token) {
    return NextResponse.redirect(
      new URL('/register/failure', request.url),
    );
  }

  // Extract email from JWT payload for the failure page's resend form
  let email = '';
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    email = payload.email || '';
  } catch {}

  try {
    // Call Better Auth's internal verification API
    // nextCookies() plugin handles session cookie setting in Route Handlers
    await auth.api.verifyEmail({
      query: { token, callbackURL },
      headers: request.headers,
    });

    // If verifyEmail resolves without throwing, redirect to callbackURL
    return NextResponse.redirect(new URL(callbackURL, request.url));
  } catch (error: any) {
    // Better Auth throws APIError with status FOUND (302) for redirects.
    // Distinguish success redirects from failure redirects.
    if (error?.status === 'FOUND' || error?.statusCode === 302) {
      const location = error?.headers?.get?.('location') || '';

      if (location && !location.includes('error=')) {
        // Success: email verified, session created. Redirect to callbackURL.
        // nextCookies() plugin already set session cookies via next/headers cookies() API.
        const redirectUrl = new URL(location || callbackURL, request.url);
        const response = NextResponse.redirect(redirectUrl);

        // Forward session cookies from Better Auth's response headers
        const setCookies = error?.headers?.getSetCookie?.();
        if (setCookies && setCookies.length > 0) {
          for (const cookie of setCookies) {
            response.headers.append('set-cookie', cookie);
          }
        }

        return response;
      }
    }

    // Token expired, invalid, or unknown error — redirect to failure page
    console.error('[VERIFY_EMAIL] Verification failed:', error);
    const failureUrl = new URL('/register/failure', request.url);
    if (email) {
      failureUrl.searchParams.set('email', email);
    }
    return NextResponse.redirect(failureUrl);
  }
}
