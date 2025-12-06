import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { headers } from 'next/headers';

/**
 * JWT Endpoint for Better Auth
 *
 * Returns the JWT token for the current authenticated user
 * Used by Supabase client to get JWT for RLS policies
 */
export async function GET(request: NextRequest) {
  try {
    // Get session from Better Auth using headers
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.session || !session?.user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Generate JWT using Better Auth JWT plugin
    const result = await auth.api.signJWT({
      body: {
        payload: {
          sub: session.user.id,
          email: session.user.email,
          role: (session.user as any).role || 'user',
          type: (session.user as any).type || 'user',
        },
      },
    });

    // Extract the actual token string from the result
    const token = typeof result === 'string' ? result : (result as any)?.token;

    if (!token) {
      console.error('JWT generation failed - no token in result:', result);
      return NextResponse.json(
        { error: 'Failed to generate JWT token' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      token,
      expiresIn: 900, // 15 minutes
    });
  } catch (error) {
    console.error('JWT generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate JWT' },
      { status: 500 }
    );
  }
}
