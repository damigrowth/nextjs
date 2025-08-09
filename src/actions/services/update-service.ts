'use server';

import { revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma/client';
import { ActionResponse } from '@/lib/types/api';
import { requireAuth, hasAnyRole } from '@/actions/auth/server';
import { Prisma } from '@prisma/client';
import {
  createServiceSchema,
  type CreateServiceInput,
} from '@/lib/validations/service';
import {
  getFormString,
  getFormJSON,
  getFormInt,
  getFormBoolean,
} from '@/lib/utils/form';
import { createValidationErrorResponse } from '@/lib/utils/zod';
import { handleBetterAuthError } from '@/lib/utils/better-auth-localization';

/**
 * Server action for updating an existing service
 * Follows FORMS.md server action patterns
 */
export async function updateServiceAction(
  prevState: ActionResponse | null,
  formData: FormData,
): Promise<ActionResponse> {
  try {
    // 1. Require authentication
    const session = await requireAuth();
    const user = session.user;

    // 2. Check permissions - only freelancers and companies can update services
    const roleCheck = await hasAnyRole(['freelancer', 'company']);
    if (!roleCheck.success || !roleCheck.data) {
      return {
        success: false,
        message:
          'Μόνο επαγγελματίες και επιχειρήσεις μπορούν να ενημερώσουν υπηρεσίες',
      };
    }

    // 3. Get service ID
    const serviceId = getFormString(formData, 'serviceId');
    if (!serviceId) {
      return {
        success: false,
        message: 'Το ID της υπηρεσίας είναι απαραίτητο',
      };
    }

    // 4. Check if service exists and belongs to user
    const existingService = await prisma.service.findUnique({
      where: { id: serviceId },
      include: { profile: true },
    });

    if (!existingService) {
      return {
        success: false,
        message: 'Δεν βρέθηκε η υπηρεσία',
      };
    }

    if (existingService.profile.uid !== user.id) {
      return {
        success: false,
        message: 'Δεν έχετε δικαίωμα να ενημερώσετε αυτήν την υπηρεσία',
      };
    }

    // 5. Extract form data using utility functions
    const title = getFormString(formData, 'title');
    const description = getFormString(formData, 'description');
    const category = getFormString(formData, 'category');
    const subcategory = getFormString(formData, 'subcategory');
    const subdivision = getFormString(formData, 'subdivision');
    const subscription = getFormString(formData, 'subscription') || undefined;
    const serviceLocation =
      getFormString(formData, 'serviceLocation') || undefined;

    // Parse JSON fields with proper error handling
    const typeData = getFormJSON(formData, 'type', {
      presence: false,
      online: false,
      oneoff: false,
      onbase: false,
      subscription: false,
      onsite: false,
    });
    const tagsData = getFormJSON<string[]>(formData, 'tags', []);
    const addonsData = getFormJSON<any[]>(formData, 'addons', []);
    const faqData = getFormJSON<any[]>(formData, 'faq', []);
    const mediaData = getFormJSON<any[]>(formData, 'media', []);

    // Extract numeric and boolean fields
    const price = getFormInt(formData, 'price');
    const duration = getFormInt(formData, 'duration') || undefined;
    const fixed = getFormBoolean(formData, 'fixed', true);

    // 6. Validate JSON fields
    if (formData.get('type') && !typeData) {
      return {
        success: false,
        message: 'Λάθος δεδομένα τύπου υπηρεσίας',
      };
    }

    if (formData.get('tags') && !Array.isArray(tagsData)) {
      return {
        success: false,
        message: 'Λάθος δεδομένα tags',
      };
    }

    // 7. Validate form data with Zod schema
    const validationResult = createServiceSchema.safeParse({
      type: typeData,
      subscription,
      title,
      description,
      category,
      subcategory,
      subdivision,
      tags: tagsData,
      price,
      fixed,
      duration,
      serviceLocation,
      addons: addonsData,
      faq: faqData,
      media: mediaData,
    });

    if (!validationResult.success) {
      return createValidationErrorResponse(
        validationResult.error,
        'Μη έγκυρα δεδομένα υπηρεσίας',
      );
    }

    const data = validationResult.data;

    // 8. Type configuration is already in the correct Boolean structure from form
    const typeConfig = data.type;

    // 9. Update service in database
    const updatedService = await prisma.service.update({
      where: { id: serviceId },
      data: {
        title: data.title,
        description: data.description,
        category: data.category,
        subcategory: data.subcategory,
        subdivision: data.subdivision,
        tags: data.tags || [],
        price: data.price,
        fixed: data.fixed,
        type: typeConfig as Prisma.JsonValue,
        subscription: data.subscription || null,
        duration: data.duration || 0,
        location: data.serviceLocation || null,
        addons: (data.addons || []) as Prisma.JsonValue[],
        faq: (data.faq || []) as Prisma.JsonValue[],
        updatedAt: new Date(),
      },
    });

    // 10. TODO: Handle media update if provided
    // Note: Media handling would go here when implementing file uploads
    // For now, we skip media processing

    // 11. Revalidate cached data
    revalidateTag(`user-${user.id}`);
    revalidateTag(`profile-${user.id}`);
    revalidateTag('services');
    revalidateTag(`user-services-${user.id}`);
    revalidateTag(`service-${serviceId}`);

    return {
      success: true,
      message: 'Η υπηρεσία ενημερώθηκε επιτυχώς!',
    };
  } catch (error: any) {
    // 12. Comprehensive error handling
    console.error('Service update error:', error);

    if (error.message?.includes('redirect')) {
      // Redirect errors should be re-thrown
      throw error;
    }

    return handleBetterAuthError(error);
  }
}

/**
 * Server action for toggling service published status
 */
export async function toggleServiceStatusAction(
  prevState: ActionResponse | null,
  formData: FormData,
): Promise<ActionResponse> {
  try {
    // 1. Require authentication
    const session = await requireAuth();
    const user = session.user;

    // 2. Check permissions
    const roleCheck = await hasAnyRole(['freelancer', 'company']);
    if (!roleCheck.success || !roleCheck.data) {
      return {
        success: false,
        message: 'Δεν έχετε δικαίωμα να αλλάξετε την κατάσταση υπηρεσιών',
      };
    }

    // 3. Get service ID
    const serviceId = getFormString(formData, 'serviceId');
    if (!serviceId) {
      return {
        success: false,
        message: 'Το ID της υπηρεσίας είναι απαραίτητο',
      };
    }

    // 4. Check service ownership
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: { profile: true },
    });

    if (!service) {
      return {
        success: false,
        message: 'Δεν βρέθηκε η υπηρεσία',
      };
    }

    if (service.profile.uid !== user.id) {
      return {
        success: false,
        message:
          'Δεν έχετε δικαίωμα να αλλάξετε την κατάσταση αυτής της υπηρεσίας',
      };
    }

    // 5. Toggle published status
    const updatedService = await prisma.service.update({
      where: { id: serviceId },
      data: { published: !service.published, updatedAt: new Date() },
    });

    // 6. Revalidate cached data
    revalidateTag(`user-${user.id}`);
    revalidateTag(`profile-${user.id}`);
    revalidateTag('services');
    revalidateTag(`user-services-${user.id}`);
    revalidateTag(`service-${serviceId}`);

    return {
      success: true,
      message: updatedService.published
        ? 'Η υπηρεσία δημοσιεύθηκε επιτυχώς!'
        : 'Η υπηρεσία αποσύρθηκε από τη δημοσίευση!',
    };
  } catch (error: any) {
    console.error('Toggle service status error:', error);
    return handleBetterAuthError(error);
  }
}
