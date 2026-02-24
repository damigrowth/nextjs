'use server';

import { auth } from '@/lib/auth';
import { ActionResponse } from '@/lib/types/api';
import { z } from 'zod';

const resendSchema = z.object({
  email: z.string().email('Μη έγκυρη διεύθυνση email'),
});

export async function resendVerificationEmail(
  prevState: ActionResponse | null,
  formData: FormData,
): Promise<ActionResponse> {
  try {
    const email = formData.get('email') as string;

    const validated = resendSchema.safeParse({ email });
    if (!validated.success) {
      return {
        success: false,
        message: 'Παρακαλώ εισάγετε μια έγκυρη διεύθυνση email',
      };
    }

    // Use Better Auth's built-in sendVerificationEmail API
    // This generates a new token and calls the sendVerificationEmail callback in config.ts
    await auth.api.sendVerificationEmail({
      body: {
        email: validated.data.email,
        callbackURL: '/dashboard',
      },
    });

    return {
      success: true,
      message:
        'Το email επιβεβαίωσης στάλθηκε! Έλεγξε τα εισερχόμενά σου και τον φάκελο spam.',
    };
  } catch (error: any) {
    console.error('Resend verification email error:', error);

    // Check for rate limiting from Better Auth
    const errorCode = error?.body?.code || error?.code;
    if (errorCode === 'TOO_MANY_REQUESTS') {
      return {
        success: false,
        message:
          'Πάρα πολλές προσπάθειες. Παρακαλώ δοκίμασε ξανά σε λίγα λεπτά.',
      };
    }

    // For security, always return success even on error
    // (don't reveal if email exists or not)
    return {
      success: true,
      message:
        'Αν το email υπάρχει στο σύστημά μας, θα λάβεις ένα νέο email επιβεβαίωσης.',
    };
  }
}
