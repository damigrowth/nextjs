'use server';

import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const updateAccountSchema = z.object({
  displayName: z
    .string()
    .min(2, 'Το όνομα προβολής πρέπει να έχει τουλάχιστον 2 χαρακτήρες')
    .max(50, 'Το όνομα προβολής δεν μπορεί να υπερβαίνει τους 50 χαρακτήρες'),
});

type UpdateAccountInput = z.infer<typeof updateAccountSchema>;

interface UpdateAccountResult {
  success: boolean;
  error?: string;
  data?: any;
}

export async function updateAccount(input: UpdateAccountInput): Promise<UpdateAccountResult> {
  try {
    // Validate input
    const validatedInput = updateAccountSchema.parse(input);

    // Get current session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return {
        success: false,
        error: 'Δεν είστε συνδεδεμένος',
      };
    }

    // Update user displayName using Better Auth API
    const userResult = await auth.api.updateUser({
      headers: await headers(),
      body: {
        name: validatedInput.displayName,
        displayName: validatedInput.displayName,
      },
    });

    if (!userResult) {
      return {
        success: false,
        error: 'Αποτυχία ενημέρωσης λογαριασμού',
      };
    }

    // Update profile displayName if profile exists
    try {
      await prisma.profile.updateMany({
        where: { uid: session.user.id },
        data: {
          displayName: validatedInput.displayName,
        },
      });
    } catch (profileError) {
      // Profile might not exist, which is fine
      console.log('Profile update skipped (may not exist):', profileError);
    }

    return {
      success: true,
      data: userResult,
    };
  } catch (error: any) {
    console.error('Update account error:', error);

    if (error.name === 'ZodError') {
      return {
        success: false,
        error: error.errors?.[0]?.message || 'Μη έγκυρα δεδομένα',
      };
    }

    // Handle specific Better Auth errors
    if (error.message?.includes('email')) {
      return {
        success: false,
        error: 'Αυτό το email χρησιμοποιείται ήδη',
      };
    }

    if (error.message?.includes('username')) {
      return {
        success: false,
        error: 'Αυτό το username χρησιμοποιείται ήδη',
      };
    }

    return {
      success: false,
      error: error.message || 'Σφάλμα κατά την ενημέρωση του λογαριασμού',
    };
  }
}