'use server';

import { prisma } from '@/lib/prisma/client';
import { ActionResponse } from '@/lib/types/api';
import { requireAuth } from './server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { Prisma, UserRole, UserType, JourneyStep } from '@prisma/client';
import { CloudinaryResource } from '@/lib/types/cloudinary';
import { onboardingFormSchemaWithMedia } from '@/lib/validations';
import { getFormString, getFormJSON } from '@/lib/utils/form';
import { createValidationErrorResponse } from '@/lib/utils/zod';
import { handleBetterAuthError } from '@/lib/utils/better-auth-error';
import {
  processImageForDatabase,
  sanitizeCloudinaryResources,
} from '@/lib/utils/cloudinary';
import { brevoWorkflowService, sendNewProfileEmail } from '@/lib/email';
import { normalizeTerm } from '@/lib/utils/text/normalize';

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

    // CRITICAL: Validate image is required for pro users and not a blob URL
    if (!processedImage || processedImage.length === 0) {
      return {
        success: false,
        message: 'Η εικόνα προφίλ είναι υποχρεωτική για επαγγελματικό προφίλ',
      };
    }

    // Reject blob URLs (client-side temporary URLs that should never be saved to database)
    if (processedImage.startsWith('blob:')) {
      return {
        success: false,
        message: 'Η εικόνα δεν έχει ανέβει. Παρακαλώ περιμένετε να ολοκληρωθεί το ανέβασμα και δοκιμάστε ξανά.',
      };
    }

    // Ensure it's a valid HTTPS URL (Cloudinary or Google OAuth)
    if (!processedImage.startsWith('https://')) {
      return {
        success: false,
        message: 'Μη έγκυρη διεύθυνση εικόνας προφίλ',
      };
    }

    // Create or update profile with onboarding data
    const profile = await prisma.profile.upsert({
      where: { uid: user.id },
      update: {
        type:
          user.role === 'freelancer' || user.role === 'company'
            ? user.role
            : 'freelancer', // Sync user.role to profile.type
        bio: data.bio,
        bioNormalized: data.bio ? normalizeTerm(data.bio) : null,
        category: data.category,
        subcategory: data.subcategory,
        coverage: data.coverage,
        ...(processedImage && { image: processedImage }), // Only include if image exists
        portfolio: sanitizedPortfolio,
        visibility: { email: false, phone: true, address: true }, // Default visibility settings - email hidden
        published: user.role !== 'user',
        isActive: true,
        // Sync user fields to profile
        username: user.username,
        displayName: user.displayName,
        displayNameNormalized: user.displayName ? normalizeTerm(user.displayName) : null,
        email: user.email,
      },
      create: {
        type:
          user.role === 'freelancer' || user.role === 'company'
            ? user.role
            : 'freelancer', // Sync user.role to profile.type
        bio: data.bio,
        bioNormalized: data.bio ? normalizeTerm(data.bio) : null,
        category: data.category,
        subcategory: data.subcategory,
        coverage: data.coverage,
        ...(processedImage && { image: processedImage }), // Only include if image exists
        portfolio: sanitizedPortfolio,
        visibility: { email: false, phone: true, address: true }, // Default visibility settings - email hidden
        published: user.role !== 'user',
        isActive: true,
        // Sync user fields to profile
        username: user.username,
        displayName: user.displayName,
        displayNameNormalized: user.displayName ? normalizeTerm(user.displayName) : null,
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

    // Send email notification to admin (non-blocking, only for pro users)
    if (user.type === 'pro') {
      sendNewProfileEmail(
        {
          id: Number(profile.id),
          name: user.displayName || user.username || 'Unknown',
          username: user.username || '',
        },
        {
          email: user.email || '',
          type: user.type,
        },
      ).catch((error) => {
        console.error('Failed to send new profile email:', error);
      });
    }

    // Revalidate dashboard path to ensure fresh data
    revalidatePath('/dashboard');

    // Move user to noservices list after onboarding completion
    // This runs asynchronously and doesn't block onboarding
    brevoWorkflowService
      .handleOnboardingComplete(user.email, {
        DISPLAY_NAME: user.displayName || undefined,
        USERNAME: user.username || undefined,
        USER_TYPE: user.type as 'user' | 'pro', // Type assertion for literal type
        USER_ROLE: user.role as 'user' | 'freelancer' | 'company' | 'admin', // Type assertion for literal type
        IS_PRO: user.type === 'pro',
      })
      .catch((error) => {
        console.error('Failed to move user to noservices list:', error);
        // Don't throw - this shouldn't block onboarding
      });

    return {
      success: true,
      message: 'Η εγγραφή ολοκληρώθηκε επιτυχώς!',
    };
  } catch (error: any) {
    // Use comprehensive Better Auth error handling
    return handleBetterAuthError(error);
  }
}
