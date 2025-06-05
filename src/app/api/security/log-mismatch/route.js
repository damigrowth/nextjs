import { NextResponse } from 'next/server';

/**
 * Security logging endpoint for tracking user data mismatches
 * Logs critical security issues to help identify and resolve profile mixing
 */
export async function POST(request) {
  try {
    const body = await request.json();
    
    const {
      type,
      userId,
      userEmail,
      freelancerId,
      freelancerEmail,
      freelancerUserId,
      userUsername,
      freelancerUsername,
      timestamp
    } = body;

    // Log to console (in production, you'd send to a logging service)
    console.error('🚨 SECURITY_MISMATCH_DETECTED:', {
      type,
      userId,
      userEmail,
      freelancerId,
      freelancerEmail,
      freelancerUserId,
      userUsername,
      freelancerUsername,
      timestamp,
      userAgent: request.headers.get('user-agent'),
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    });

    // In production, you might want to:
    // 1. Store in database for analysis
    // 2. Send alerts to monitoring systems
    // 3. Notify administrators immediately for critical issues
    
    if (type === 'EMAIL_MISMATCH' || type === 'USER_FREELANCER_MISMATCH') {
      // These are critical security issues
      console.error('🔥 CRITICAL SECURITY ALERT: Profile data mixing detected!');
      
      // You could trigger immediate alerts here:
      // - Send to Slack/Discord
      // - Email administrators
      // - Log to external monitoring service
    }

    return NextResponse.json({ 
      logged: true,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Error logging security mismatch:', error);
    
    // Still return success to not break user experience
    return NextResponse.json({ 
      logged: false,
      error: 'Logging failed'
    });
  }
}
