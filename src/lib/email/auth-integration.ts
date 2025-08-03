/**
 * Email Integration for Better Auth
 * 
 * Simplified functions for Better Auth integration.
 * These can be called from auth configuration or client-side code.
 */

import { sendAuthEmail, type AuthUser } from './service';

/**
 * Send verification email for Better Auth
 */
export async function sendVerificationEmail(
  userEmail: string,
  userName?: string,
  verificationUrl?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const user: AuthUser = {
      id: 'temp-id',
      email: userEmail,
      name: userName || 'User',
      emailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      role: 'user',
      step: 'EMAIL_VERIFICATION',
      confirmed: false,
      blocked: false,
      banned: false,
    };

    await sendAuthEmail('VERIFICATION', user, verificationUrl);
    
    return { success: true };
  } catch (error) {
    console.error(`Failed to send verification email to ${userEmail}:`, error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to send verification email' 
    };
  }
}

/**
 * Send welcome email for Better Auth
 */
export async function sendWelcomeEmail(
  userEmail: string,
  userName?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const user: AuthUser = {
      id: 'temp-id',
      email: userEmail,
      name: userName || 'User',
      emailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      role: 'user',
      step: 'EMAIL_VERIFICATION',
      confirmed: false,
      blocked: false,
      banned: false,
    };

    await sendAuthEmail('WELCOME', user);
    
    return { success: true };
  } catch (error) {
    console.error(`Failed to send welcome email to ${userEmail}:`, error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to send welcome email' 
    };
  }
}

/**
 * Send password reset email for Better Auth
 */
export async function sendPasswordResetEmail(
  userEmail: string,
  userName?: string,
  resetUrl?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const user: AuthUser = {
      id: 'temp-id',
      email: userEmail,
      name: userName || 'User',
      emailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      role: 'user',
      step: 'EMAIL_VERIFICATION',
      confirmed: false,
      blocked: false,
      banned: false,
    };

    await sendAuthEmail('PASSWORD_RESET', user, resetUrl);
    
    return { success: true };
  } catch (error) {
    console.error(`Failed to send password reset email to ${userEmail}:`, error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to send password reset email' 
    };
  }
}

/**
 * Generic auth email sender - can be used for any template type
 */
export async function sendAuthEmailGeneric(
  templateType: string,
  userEmail: string,
  userName?: string,
  actionUrl?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const user: AuthUser = {
      id: 'temp-id',
      email: userEmail,
      name: userName || 'User',
      emailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      role: 'user',
      step: 'EMAIL_VERIFICATION',
      confirmed: false,
      blocked: false,
      banned: false,
    };

    await sendAuthEmail(templateType, user, actionUrl);
    
    return { success: true };
  } catch (error) {
    console.error(`Failed to send ${templateType} email to ${userEmail}:`, error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : `Failed to send ${templateType} email` 
    };
  }
}