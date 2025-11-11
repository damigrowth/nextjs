'use server';

import { prisma } from '@/lib/prisma/client';
import { ActionResponse } from '@/lib/types/api';
import { requireAuth } from './server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { Prisma } from '@prisma/client';
import { CloudinaryResource } from '@/lib/types/cloudinary';
import { onboardingFormSchemaWithMedia } from '@/lib/validations';
import { getFormString, getFormJSON } from '@/lib/utils/form';
import { createValidationErrorResponse } from '@/lib/utils/zod';
import { handleBetterAuthError } from '@/lib/utils/better-auth-localization';
import {
  processImageForDatabase,
  sanitizeCloudinaryResources,
} from '@/lib/utils/cloudinary';

/**
 * Complete onboarding action wrapper for useActionState
 */
export async function completeOnboarding(
  prevState: ActionResponse | null,
  formData: FormData,
): Promise<ActionResponse> {
  try {
    // Get authenticated session
    const session = await requireAuth();
    const user = session.user;

    if (user.step !== 'ONBOARDING') {
      return {
        success: false,
        message: 'Ο λογαριασμός δεν είναι στη φάση ολοκλήρωσης εγγραφής',
      };
    }

    // Extract form data
    const bio = getFormString(formData, 'bio');
    const category = getFormString(formData, 'category');
    const subcategory = getFormString(formData, 'subcategory');

    // Parse JSON fields with proper error handling
    const imageData = getFormJSON<CloudinaryResource | null>(
      formData,
      'image',
      null,
    );
    const portfolioData = getFormJSON<CloudinaryResource[]>(
      formData,
      'portfolio',
      [],
    );
    const coverageData = getFormJSON<any>(formData, 'coverage', {});

    // Validate required JSON fields
    if (formData.get('image') && !imageData) {
      return {
        success: false,
        message: 'Λάθος δεδομένα εικόνας προφίλ',
      };
    }

    if (formData.get('coverage') && Object.keys(coverageData).length === 0) {
      return {
        success: false,
        message: 'Λάθος δεδομένα κάλυψης υπηρεσιών',
      };
    }

    // Validate form data with Zod schema
    const validationResult = onboardingFormSchemaWithMedia.safeParse({
      image: imageData,
      bio,
      category,
      subcategory,
      coverage: coverageData,
      portfolio: portfolioData,
    });

    if (!validationResult.success) {
      return createValidationErrorResponse(
        validationResult.error,
        'Μη έγκυρα δεδομένα φόρμας',
      );
    }

    const data = validationResult.data;

    // Process image and portfolio data for database storage
    const processedImage = processImageForDatabase(data.image);
    const sanitizedPortfolio = sanitizeCloudinaryResources(data.portfolio);

    // Create or update profile with onboarding data
    await prisma.profile.upsert({
      where: { uid: user.id },
      update: {
        type: user.role === 'freelancer' || user.role === 'company' ? user.role : 'freelancer', // Sync user.role to profile.type
        bio: data.bio,
        category: data.category,
        subcategory: data.subcategory,
        coverage: data.coverage,
        ...(processedImage && { image: processedImage }), // Only include if image exists
        portfolio: sanitizedPortfolio,
        published: user.role !== 'user',
        isActive: true,
        // Sync user fields to profile
        username: user.username,
        displayName: user.displayName,
        email: user.email,
      },
      create: {
        type: user.role === 'freelancer' || user.role === 'company' ? user.role : 'freelancer', // Sync user.role to profile.type
        bio: data.bio,
        category: data.category,
        subcategory: data.subcategory,
        coverage: data.coverage,
        ...(processedImage && { image: processedImage }), // Only include if image exists
        portfolio: sanitizedPortfolio,
        published: user.role !== 'user',
        isActive: true,
        // Sync user fields to profile
        username: user.username,
        displayName: user.displayName,
        email: user.email,
        user: {
          connect: { id: user.id },
        },
      },
    });

    // Update user step to DASHBOARD and sync image using Better Auth API
    try {
      await auth.api.updateUser({
        headers: await headers(),
        body: {
          step: 'DASHBOARD',
          ...(processedImage && { image: processedImage }), // Only sync if image exists
        },
      });
    } catch (authError) {
      console.warn(
        'Failed to update user via Better Auth, falling back to Prisma:',
        authError,
      );
      // Fallback to direct Prisma update if Better Auth fails
      await prisma.user.update({
        where: { id: user.id },
        data: {
          step: 'DASHBOARD',
          ...(processedImage && { image: processedImage }), // Only update if image exists
        },
      });
    }

    // Revalidate dashboard path to ensure fresh data
    revalidatePath('/dashboard');

    return {
      success: true,
      message: 'Η εγγραφή ολοκληρώθηκε επιτυχώς!',
    };
  } catch (error: any) {
    // Use comprehensive Better Auth error handling
    return handleBetterAuthError(error);
  }
}
