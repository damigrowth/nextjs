'use server';

import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { prisma } from '@/lib/prisma/client';

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

    // Start transaction to delete all user data
    await prisma.$transaction(async (tx) => {
      const userId = session.user.id;

      // Delete profile and related data (cascading deletes will handle relations)
      await tx.profile.deleteMany({
        where: { uid: userId },
      });

      // Delete media files
      await tx.media.deleteMany({
        where: { userId: userId },
      });

      // // Delete message reads
      // await tx.messageRead.deleteMany({
      //   where: { user: userId },
      // });

      // Delete reviews given by user
      await tx.review.deleteMany({
        where: { authorId: userId },
      });

      // The user deletion via Better Auth should cascade other relations
    });

    // // Delete user using Better Auth API
    // const result = await auth.api.deleteUser({
    //   headers: await headers(),
    // });

    // if (!result) {
    //   return {
    //     success: false,
    //     error: 'Αποτυχία διαγραφής λογαριασμού',
    //   };
    // }

    // Redirect to home page after successful deletion
    redirect('/');
  } catch (error: any) {
    console.error('Delete account error:', error);

    if (error.name === 'ZodError') {
      return {
        success: false,
        error: error.errors?.[0]?.message || 'Μη έγκυρα δεδομένα',
      };
    }

    return {
      success: false,
      error: error.message || 'Σφάλμα κατά τη διαγραφή του λογαριασμού',
    };
  }
}
