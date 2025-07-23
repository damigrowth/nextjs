'use server';

import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { registerSchema } from '@/lib/validations/auth';
import { ActionResult } from '@/lib/types/api';
import { RegisterInput } from '@/lib/validations/auth';

export async function register(prevState: any, formData: FormData): Promise<ActionResult<void>> {
  try {
    const email = formData.get('email') as string;
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;
    const displayName = formData.get('displayName') as string;
    const role = formData.get('role') as string || 'user';
    const consent = formData.get('consent') as string;

    // Validate consent
    if (!consent) {
      return {
        success: false,
        error: 'You must accept the terms and conditions',
        fieldErrors: {
          consent: ['You must accept the Terms of Use'],
        },
      };
    }

    const validatedFields = registerSchema.safeParse({
      email,
      username,
      password,
      displayName,
      role,
      name: displayName,
      consent: consent === 'on',
    });

    if (!validatedFields.success) {
      return {
        success: false,
        error: 'Invalid registration data',
        fieldErrors: validatedFields.error.flatten().fieldErrors,
      };
    }

    const data = validatedFields.data;

    // Use Better Auth to create user
    const result = await auth.api.signUpEmail({
      body: {
        email: data.email,
        password: data.password,
        name: data.name || data.displayName,
        username: data.username,
        displayName: data.displayName,
        role: data.role,
      },
    });

    if (!result.user) {
      return {
        success: false,
        error: 'Registration failed. Please try again.',
      };
    }

    redirect('/register/success');

  } catch (error: any) {
    console.error('Registration error:', error);
    
    // Handle specific Better Auth errors
    if (error.message?.includes('email')) {
      return {
        success: false,
        error: 'This email is already registered',
        fieldErrors: {
          email: ['This email is already in use'],
        },
      };
    }

    if (error.message?.includes('username')) {
      return {
        success: false,
        error: 'This username is already taken',
        fieldErrors: {
          username: ['This username is already taken'],
        },
      };
    }

    return {
      success: false,
      error: 'Registration failed. Please try again.',
    };
  }
}

/**
 * Register function for programmatic use
 */
export async function registerUser(input: RegisterInput): Promise<ActionResult<{ user: any }>> {
  try {
    const validatedFields = registerSchema.safeParse(input);

    if (!validatedFields.success) {
      return {
        success: false,
        error: 'Invalid input',
      };
    }

    const data = validatedFields.data;

    const result = await auth.api.signUpEmail({
      body: {
        email: data.email,
        password: data.password,
        name: data.name || data.displayName,
        username: data.username,
        displayName: data.displayName,
        role: data.role,
      },
    });

    if (!result.user) {
      return {
        success: false,
        error: 'Registration failed',
      };
    }

    return {
      success: true,
      data: {
        user: result.user,
      },
    };
  } catch (error: any) {
    console.error('Registration error:', error);
    return {
      success: false,
      error: error.message || 'Registration failed',
    };
  }
}