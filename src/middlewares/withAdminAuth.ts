import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function withAdminAuth(request: NextRequest) {
  try {
    // Get session from the request
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    // Check if user is authenticated
    if (!session?.user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Check if user has admin role or is in adminUserIds
    const isAdmin = session.user.role === 'admin' || 
      (process.env.ADMIN_USER_IDS?.split(',') || []).includes(session.user.id);

    if (!isAdmin) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // User is authenticated and is admin, continue to the admin page
    return NextResponse.next();
  } catch (error) {
    console.error('Admin auth middleware error:', error);
    return NextResponse.redirect(new URL('/login', request.url));
  }
}