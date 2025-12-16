import { NextRequest, NextResponse } from 'next/server';
import { SignJWT, jwtVerify } from 'jose';

/**
 * Token Exchange API Route
 *
 * Exchanges Better Auth JWT for Supabase-signed JWT
 * This enables Supabase RLS policies to work with Better Auth
 *
 * Flow:
 * 1. Client sends Better Auth JWT
 * 2. Server verifies Better Auth JWT
 * 3. Server creates new JWT with Supabase secret
 * 4. Client uses Supabase JWT for database operations
 */

const BETTER_AUTH_SECRET = process.env.BETTER_AUTH_SECRET!;
const SUPABASE_JWT_SECRET = process.env.SUPABASE_JWT_SECRET!;

// Verify environment variables are set
if (!BETTER_AUTH_SECRET) {
  throw new Error('BETTER_AUTH_SECRET environment variable is required');
}

if (!SUPABASE_JWT_SECRET) {
  throw new Error('SUPABASE_JWT_SECRET environment variable is required');
}

export async function POST(request: NextRequest) {
  try {
    // Get Better Auth JWT from request
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 400 }
      );
    }

    // Verify Better Auth JWT
    const betterAuthSecret = new TextEncoder().encode(BETTER_AUTH_SECRET);
    const { payload: betterAuthPayload } = await jwtVerify(token, betterAuthSecret);

    // Extract user information from Better Auth JWT
    const userId = betterAuthPayload.sub;
    const userEmail = betterAuthPayload.email as string;
    const userRole = betterAuthPayload.role as string || 'user';
    const userType = (betterAuthPayload as any).type as string || 'user';

    if (!userId) {
      return NextResponse.json(
        { error: 'Invalid token: missing user ID' },
        { status: 401 }
      );
    }

    // Create Supabase JWT with required claims
    const supabaseSecret = new TextEncoder().encode(SUPABASE_JWT_SECRET);

    const supabaseToken = await new SignJWT({
      sub: userId,                    // User ID (required for RLS)
      email: userEmail,
      role: userRole,                 // Postgres role for RLS
      type: userType,
      aud: 'authenticated',           // Audience (Supabase expects this)
      iss: 'better-auth',             // Issuer
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('15m')        // Match Better Auth JWT expiration
      .setIssuedAt()
      .sign(supabaseSecret);

    return NextResponse.json({
      token: supabaseToken,
      expiresIn: 900, // 15 minutes in seconds
    });

  } catch (error) {
    console.error('Token exchange error:', error);

    // Return 401 for invalid/expired tokens
    if (error instanceof Error && error.message.includes('expired')) {
      return NextResponse.json(
        { error: 'Token expired' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Invalid token' },
      { status: 401 }
    );
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Token exchange endpoint is operational',
  });
}
