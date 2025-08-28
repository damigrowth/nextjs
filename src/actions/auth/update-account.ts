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

interface ActionState {
  success: boolean;
  message: string;
}

export async function updateAccount(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    // Extract data from FormData
    const displayName = formData.get('displayName') as string;

    const result = await updateAccountInternal({ displayName });

    if (!result.success) {
      return {
        success: false,
        message: result.error || 'Σφάλμα κατά την ενημέρωση',
      };
    }

    return {
      success: true,
      message: 'Οι ρυθμίσεις του λογαριασμού ενημερώθηκαν επιτυχώς!',
    };
  } catch (error: any) {
    console.error('Update account action error:', error);
    return {
      success: false,
      message: error.message || 'Σφάλμα κατά την ενημέρωση του λογαριασμού',
    };
  }
}

export async function updateAccountInternal(input: UpdateAccountInput): Promise<UpdateAccountResult> {
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

    // First update the profile if it exists (since it may trigger UI updates)
    try {
      await prisma.profile.updateMany({
        where: { uid: session.user.id },
        data: {
          displayName: validatedInput.displayName,
        },
      });
    } catch (profileError) {
      // Profile might not exist, which is fine for some users
      console.log('Profile update skipped (may not exist):', profileError);
    }

    // Then update the Better Auth user displayName
    const userResult = await auth.api.updateUser({
      headers: await headers(),
      body: {
        displayName: validatedInput.displayName,
        name: validatedInput.displayName, // Also update name field for consistency
      },
    });

    if (!userResult) {
      return {
        success: false,
        error: 'Αποτυχία ενημέρωσης λογαριασμού',
      };
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