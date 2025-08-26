import { getCurrentUser } from '@/actions/auth/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const result = await getCurrentUser();

    if (result.success) {
      return NextResponse.json({
        user: result.data.user,
        session: result.data.session, 
        profile: result.data.profile,
      });
    } else {
      // Not authenticated or error
      return NextResponse.json(
        { error: result.error || 'Not authenticated' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Auth me API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}