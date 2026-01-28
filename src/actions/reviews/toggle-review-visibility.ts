'use server';

import { prisma } from '@/lib/prisma/client';
import { revalidateTag } from 'next/cache';
import { ActionResponse } from '@/lib/types/api';
import { requireAuth } from '@/actions/auth/server';
import { CACHE_TAGS } from '@/lib/cache';

/**
 * Toggle review visibility (visibility field)
 * Professional controls whether review comments are visible to the public
 * Admin approval (published) is separate from professional visibility control
 * Only the profile owner can toggle visibility of reviews they received
 */
export async function toggleReviewVisibility(
  reviewId: string,
): Promise<ActionResponse> {
  try {
    // 1. Get authenticated session
    const session = await requireAuth();
    const user = session.user;

    // 2. Get the review with profile information
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        profile: {
          select: {
            id: true,
            uid: true,
            username: true,
          },
        },
        service: {
          select: {
            id: true,
            slug: true,
          },
        },
      },
    });

    if (!review) {
      return {
        success: false,
        message: 'Η αξιολόγηση δεν βρέθηκε',
      };
    }

    // 3. Verify user owns the profile that received the review
    if (review.profile.uid !== user.id) {
      return {
        success: false,
        message: 'Δεν έχετε δικαίωμα να επεξεργαστείτε αυτή την αξιολόγηση',
      };
    }

    // 4. Only allow toggling approved and published reviews
    if (review.status !== 'approved' || !review.published) {
      return {
        success: false,
        message: 'Μόνο εγκεκριμένες και δημοσιευμένες αξιολογήσεις μπορούν να εμφανιστούν',
      };
    }

    // 5. Toggle the visibility field
    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: {
        visibility: !review.visibility,
      },
    });

    // 6. Revalidate cache tags
    revalidateTag(CACHE_TAGS.review.byProfile(review.pid));
    revalidateTag(CACHE_TAGS.profile.byId(review.pid));
    revalidateTag(CACHE_TAGS.profile.byUsername(review.profile.username));
    revalidateTag(CACHE_TAGS.profile.page(review.profile.username));
    revalidateTag(CACHE_TAGS.dashboard.user(user.id));

    // If service review, revalidate service data
    if (review.sid && review.service?.slug) {
      revalidateTag(CACHE_TAGS.review.byService(review.sid));
      revalidateTag(CACHE_TAGS.service.byId(review.sid));
      revalidateTag(CACHE_TAGS.service.bySlug(review.service.slug));
      revalidateTag(CACHE_TAGS.service.page(review.service.slug));
    }

    // 7. Success response
    return {
      success: true,
      message: updatedReview.visibility
        ? 'Η αξιολόγηση είναι τώρα ορατή'
        : 'Η αξιολόγηση είναι τώρα κρυφή',
      data: { visibility: updatedReview.visibility },
    };
  } catch (error: any) {
    console.error('Toggle review visibility error:', error);
    return {
      success: false,
      message: 'Αποτυχία ενημέρωσης εμφάνισης αξιολόγησης',
    };
  }
}
