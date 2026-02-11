'use server';

import { prisma } from '@/lib/prisma/client';
import { createReviewSchema } from '@/lib/validations/review';
import { revalidateTag } from 'next/cache';
import { ActionResponse } from '@/lib/types/api';
import { requireAuth } from '@/actions/auth/server';
import { extractFormData } from '@/lib/utils/form';
import { createValidationErrorResponse } from '@/lib/utils/zod';
import { handleBetterAuthError } from '@/lib/utils/better-auth-error';
import { CACHE_TAGS } from '@/lib/cache';
import { getSession } from '@/actions/auth/server';
import { sendNewReviewEmail } from '@/lib/email/services/admin-emails';

/**
 * Server action for creating a review with transaction-based rating updates
 * Follows SERVER_ACTIONS_PATTERNS.md template
 */
export async function createReview(
  prevState: ActionResponse | null,
  formData: FormData,
): Promise<ActionResponse> {
  try {
    // 1. Get authenticated session
    const session = await requireAuth();
    const user = session.user;

    // 2. Extract form data using type-safe utility
    const { data: extractedData, errors: extractionErrors } = extractFormData(
      formData,
      {
        rating: { type: 'int', required: true },
        comment: { type: 'string', required: false }, // Changed: Comment is optional (Like/Unlike system)
        profileId: { type: 'string', required: true },
        serviceId: { type: 'int', required: false },
      },
    );

    if (Object.keys(extractionErrors).length > 0) {
      return {
        success: false,
        message:
          'Σφάλμα στα δεδομένα της φόρμας: ' +
          Object.values(extractionErrors).join(', '),
      };
    }

    // Debug: Log extracted data before validation
    console.log('Extracted form data:', {
      rating: extractedData.rating,
      comment: extractedData.comment,
      commentLength: typeof extractedData.comment === 'string' ? extractedData.comment.length : 0,
      profileId: extractedData.profileId,
      serviceId: extractedData.serviceId,
    });

    // Fix: Convert serviceId 0 to undefined for optional validation
    if (extractedData.serviceId === 0) {
      extractedData.serviceId = undefined;
    }

    // 3. Validate form data with Zod schema
    const validationResult = createReviewSchema.safeParse({
      rating: extractedData.rating,
      comment: extractedData.comment || null, // Handle optional comment (empty string → null)
      profileId: extractedData.profileId,
      serviceId: extractedData.serviceId,
    });

    if (!validationResult.success) {
      console.error('Review validation failed:', validationResult.error);
      return createValidationErrorResponse(
        validationResult.error,
        'Μη έγκυρα δεδομένα αξιολόγησης',
      );
    }

    const data = validationResult.data;

    // 4. Business logic validation - Check if target profile exists
    const targetProfile = await prisma.profile.findUnique({
      where: { id: data.profileId },
      select: {
        id: true,
        username: true,
        displayName: true,
        user: { select: { id: true, email: true } },
        _count: { select: { services: true } },
      },
    });

    if (!targetProfile) {
      return {
        success: false,
        message: 'Το προφίλ δεν βρέθηκε',
      };
    }

    // 4b. If profile has services, serviceId is required
    if (targetProfile._count.services > 0 && !data.serviceId) {
      return {
        success: false,
        message: 'Επιλέξτε την υπηρεσία που θα αξιολογηθεί',
      };
    }

    // 5. Prevent self-review
    if (targetProfile.user.id === user.id) {
      return {
        success: false,
        message: 'Δεν μπορείτε να αξιολογήσετε τον εαυτό σας',
      };
    }

    // 6. If serviceId provided, verify it belongs to the profile
    let service: { pid: string; slug: string | null; title: string } | null = null;
    if (data.serviceId) {
      service = await prisma.service.findUnique({
        where: { id: data.serviceId },
        select: { pid: true, slug: true, title: true },
      });

      if (!service || service.pid !== data.profileId) {
        return {
          success: false,
          message: 'Η υπηρεσία δεν βρέθηκε ή δεν ανήκει σε αυτό το προφίλ',
        };
      }
    }

    // 7. Check if user already reviewed this profile/service
    // Boss requirement: "Κάθε χρήστης μπορεί να κάνει μέχρι 1 αξιολόγηση για κάθε υπηρεσία"
    const existingReview = await prisma.review.findFirst({
      where: {
        authorId: user.id,
        pid: data.profileId,
        ...(data.serviceId && { sid: data.serviceId }),
      },
    });

    if (existingReview) {
      return {
        success: false,
        message: data.serviceId
          ? 'Έχετε ήδη αξιολογήσει αυτή την υπηρεσία'
          : 'Έχετε ήδη αξιολογήσει αυτό το προφίλ',
      };
    }

    // 8. Create review with moderation workflow (status: pending, published: false)
    // Auto-determine type based on serviceId presence
    const result = await prisma.review.create({
      data: {
        rating: data.rating,
        comment: data.comment,
        pid: data.profileId,
        sid: data.serviceId,
        authorId: user.id,
        status: 'pending', // Requires admin approval
        type: data.serviceId ? 'SERVICE' : 'PROFILE', // Auto-determine type
        published: false, // Will be set to true when approved
      },
    });

    // NOTE: Rating calculations moved to moderate-review action
    // Ratings only update when review is approved (status: 'approved', published: true)

    // Send admin notification email about new pending review
    const authorName = user.displayName || user.name || 'Ανώνυμος';
    sendNewReviewEmail(
      {
        id: result.id,
        rating: data.rating,
        comment: data.comment,
        type: data.serviceId ? 'SERVICE' : 'PROFILE',
        serviceName: service?.title,
      },
      {
        name: authorName,
        email: user.email,
      },
      {
        displayName: targetProfile.displayName || targetProfile.username,
        username: targetProfile.username,
        email: targetProfile.user.email,
      }
    );

    // 9. Revalidate cache tags for comprehensive cache invalidation
    // Revalidate profile reviews and data
    revalidateTag(CACHE_TAGS.review.byProfile(data.profileId));
    revalidateTag(CACHE_TAGS.profile.byId(data.profileId));
    revalidateTag(CACHE_TAGS.profile.byUsername(targetProfile.username));
    revalidateTag(CACHE_TAGS.profile.page(targetProfile.username));

    // Revalidate user's given reviews for dashboard
    revalidateTag(CACHE_TAGS.review.byUser(user.id));
    revalidateTag(CACHE_TAGS.dashboard.user(user.id));

    // If service review, revalidate service data
    if (data.serviceId && service?.slug) {
      revalidateTag(CACHE_TAGS.review.byService(data.serviceId));
      revalidateTag(CACHE_TAGS.service.byId(data.serviceId));
      revalidateTag(CACHE_TAGS.service.bySlug(service.slug));
      revalidateTag(CACHE_TAGS.service.page(service.slug));
    }

    // 10. Success response - Match legacy text exactly + return review ID
    return {
      success: true,
      message: 'Η αξιολόγησή σας υποβλήθηκε με επιτυχία!',
      data: { id: result.id },
    };
  } catch (error: any) {
    // 11. Comprehensive error handling
    console.error('Create review error:', error);
    return handleBetterAuthError(error);
  }
}

/**
 * Check if user can review a profile/service
 * Used for permission checking before showing review form
 */
export async function canUserReview(
  profileId: string,
  serviceId?: number,
): Promise<ActionResponse<{ canReview: boolean; reason?: string }>> {
  try {
    // Check authentication
    const sessionResult = await getSession();

    if (!sessionResult.success || !sessionResult.data.user) {
      return {
        success: true,
        message: '',
        data: { canReview: false, reason: 'Απαιτείται σύνδεση' },
      };
    }

    const user = sessionResult.data.user;

    // Check if target profile exists
    const targetProfile = await prisma.profile.findUnique({
      where: { id: profileId },
      include: { user: { select: { id: true } } },
    });

    if (!targetProfile) {
      return {
        success: true,
        message: '',
        data: { canReview: false, reason: 'Το προφίλ δεν βρέθηκε' },
      };
    }

    // Prevent self-review
    if (targetProfile.user.id === user.id) {
      return {
        success: true,
        message: '',
        data: { canReview: false, reason: 'Δεν μπορείτε να αξιολογήσετε τον εαυτό σας' },
      };
    }

    // Check for existing review
    const existingReview = await prisma.review.findFirst({
      where: {
        authorId: user.id,
        pid: profileId,
        ...(serviceId && { sid: serviceId }),
      },
    });

    if (existingReview) {
      return {
        success: true,
        message: '',
        data: {
          canReview: false,
          reason: serviceId
            ? 'Έχετε ήδη αξιολογήσει αυτή την υπηρεσία'
            : 'Έχετε ήδη αξιολογήσει αυτό το προφίλ',
        },
      };
    }

    return {
      success: true,
      message: '',
      data: { canReview: true },
    };
  } catch (error) {
    console.error('Can user review error:', error);
    return {
      success: false,
      message: 'Αποτυχία ελέγχου δικαιωμάτων',
    };
  }
}
