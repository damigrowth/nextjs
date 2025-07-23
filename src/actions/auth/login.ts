'use server';

import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { loginSchema } from '@/lib/validations/auth';
import { ActionResult } from '@/lib/types/api';
import { LoginInput } from '@/lib/validations/auth';

export async function login(prevState: any, formData: FormData): Promise<ActionResult<void>> {
  try {
    const validatedFields = loginSchema.safeParse({
      identifier: formData.get('identifier'),
      password: formData.get('password'),
    });

    if (!validatedFields.success) {
      return {
        success: false,
        error: 'Invalid login credentials',
        fieldErrors: validatedFields.error.flatten().fieldErrors,
      };
    }

    const { identifier, password } = validatedFields.data;

    // Use Better Auth to sign in
    const result = await auth.api.signInEmail({
      body: {
        email: identifier.includes('@') ? identifier : `${identifier}@example.com`, // Handle username case
        password,
      },
    });

    if (!result.user) {
      return {
        success: false,
        error: 'Invalid email or password',
      };
    }

    // Check user status and redirect appropriately
    const user = result.user as any;
    
    if (user.blocked) {
      return {
        success: false,
        error: 'Your account has been blocked',
      };
    }

    if (!user.emailVerified) {
      redirect('/email-confirmation');
    }

    // Redirect based on user step and role
    if (user.step === 'ONBOARDING') {
      redirect('/onboarding');
    } else if (user.step === 'DASHBOARD') {
      if (user.role === 'admin') {
        redirect('/admin');
      } else {
        redirect('/dashboard');
      }
    } else {
      redirect('/email-confirmation');
    }

  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      error: 'Login failed. Please try again.',
    };
  }
}

/**
 * Alternative login function using Better Auth client-side approach
 */
export async function loginWithCredentials(input: LoginInput): Promise<ActionResult<{ user: any; session: any }>> {
  try {
    const validatedFields = loginSchema.safeParse(input);

    if (!validatedFields.success) {
      return {
        success: false,
        error: 'Invalid input',
      };
    }

    const { identifier, password } = validatedFields.data;
    
    const result = await auth.api.signInEmail({
      body: {
        email: identifier.includes('@') ? identifier : `${identifier}@example.com`,
        password,
      },
    });

    if (!result.user || !result.session) {
      return {
        success: false,
        error: 'Invalid credentials',
      };
    }

    return {
      success: true,
      data: {
        user: result.user,
        session: result.session,
      },
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      error: 'Login failed. Please try again.',
    };
  }
}