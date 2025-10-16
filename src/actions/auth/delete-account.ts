'use server';

import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { z } from 'zod';

const deleteAccountSchema = z
  .object({
    username: z.string().min(1, 'Το username είναι υποχρεωτικό'),
    confirmUsername: z
      .string()
      .min(1, 'Η επιβεβαίωση username είναι υποχρεωτική'),
  })
  .refine((data) => data.username === data.confirmUsername, {
    message: 'Το username δεν ταιριάζει',
    path: ['confirmUsername'],
  });

type DeleteAccountInput = z.infer<typeof deleteAccountSchema>;

interface DeleteAccountResult {
  success: boolean;
  error?: string;
}

export async function deleteAccount(
  input: DeleteAccountInput,
): Promise<DeleteAccountResult> {
  try {
    // Validate input
    const validatedInput = deleteAccountSchema.parse(input);

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

    // Verify username matches current user
    if (session.user.username !== validatedInput.username) {
      return {
        success: false,
        error: 'Το username δεν ταιριάζει με τον λογαριασμό σας',
      };
    }

    // Use Better Auth's official deleteUser API
    // This will automatically:
    // - Delete the user record
    // - Cascade delete ALL sessions (across all devices) - fixes the session cleanup issue
    // - Cascade delete all accounts (OAuth connections)
    // - Call our beforeDelete hook to clean up verification tokens
    // - Cascade delete all user relations (Profile, Media, Reviews, etc. via Prisma schema)
    await auth.api.deleteUser({
      body: {}, // Empty body is required for the API call
      headers: await headers(),
    });

    // Return success
    return {
      success: true,
    };
  } catch (error: any) {
    // Check if it's a ZodError
    if (error.name === 'ZodError') {
      return {
        success: false,
        error: error.errors?.[0]?.message || 'Μη έγκυρα δεδομένα',
      };
    }

    console.error('Delete account error:', error);

    return {
      success: false,
      error: error.message || 'Σφάλμα κατά τη διαγραφή του λογαριασμού',
    };
  }
}
