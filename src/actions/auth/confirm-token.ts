'use server';

import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { ActionResult } from '@/lib/types/api';

interface TokenConfirmationResult {
  success: boolean;
  message: string;
  redirect: boolean;
  alreadyConfirmed?: boolean;
}

/**
 * Server action to complete user registration by confirming an email token.
 * Uses Better Auth to verify email confirmation token.
 */
export async function confirmTokenAction(
  prevState: any, 
  token: string
): Promise<ActionResult<TokenConfirmationResult>> {
  if (!token) {
    return {
      success: false,
      error: 'Missing confirmation token',
    };
  }

  try {
    // Use Better Auth to verify email token
    const result = await auth.api.verifyEmail({
      body: {
        token,
      },
    });

    if (!result.success) {
      return {
        success: false,
        error: 'Email verification failed. Token may be invalid or expired.',
      };
    }

    // Success - redirect will be handled by the component
    return {
      success: true,
      data: {
        success: true,
        message: 'Email successfully verified!',
        redirect: true,
        alreadyConfirmed: false,
      },
    };

  } catch (error: any) {
    console.error('Email verification error:', error);
    
    let errorMessage = 'An error occurred during verification.';
    
    if (error.message?.includes('network') || error.message?.includes('fetch')) {
      errorMessage = 'Connection problem. Please try again.';
    } else if (error.message?.includes('timeout')) {
      errorMessage = 'Request timed out. Please try again.';
    } else if (error.message?.includes('already')) {
      return {
        success: true,
        data: {
          success: true,
          message: 'Your email has already been verified!',
          redirect: true,
          alreadyConfirmed: true,
        },
      };
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Direct email verification function
 */
export async function verifyEmailToken(token: string): Promise<ActionResult<void>> {
  try {
    const result = await auth.api.verifyEmail({
      body: {
        token,
      },
    });

    if (!result.success) {
      return {
        success: false,
        error: 'Email verification failed',
      };
    }

    return {
      success: true,
    };
  } catch (error: any) {
    console.error('Email verification error:', error);
    return {
      success: false,
      error: error.message || 'Email verification failed',
    };
  }
}