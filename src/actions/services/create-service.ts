'use server';

import { revalidateTag, revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma/client';
import { ActionResponse } from '@/lib/types/api';
import { CACHE_TAGS, getServiceTags } from '@/lib/cache';
import { sendServiceCreatedEmail } from '@/lib/email/services';
import { brevoWorkflowService } from '@/lib/email';

// Service creation specific response type
interface ServiceActionResponse extends ActionResponse {
  serviceId?: number;
  serviceTitle?: string;
}
import { requireAuth } from '@/actions/auth/server';
import { getProfileByUserId } from '@/actions/profiles/get-profile';
import { Prisma } from '@prisma/client';
import {
  createServiceSchema,
  createServiceDraftSchema,
  type CreateServiceInput,
} from '@/lib/validations/service';
import { extractFormData } from '@/lib/utils/form';
import { createValidationErrorResponse } from '@/lib/utils/zod';
import { handleBetterAuthError } from '@/lib/utils/better-auth-localization';
import { sanitizeCloudinaryResources } from '@/lib/utils/cloudinary';
import { generateServiceSlug } from '@/lib/utils/text';
import { normalizeTerm } from '@/lib/utils/text/normalize';

/**
 * Server action for creating a new service using the multi-step form data
 * Follows SERVER_ACTIONS_PATTERNS.md template
 */
export async function createServiceAction(
  prevState: ServiceActionResponse | null,
  formData: FormData,
): Promise<ServiceActionResponse> {
  return createServiceInternal(prevState, formData, 'pending');
}

/**
 * Server action for saving service as draft
 */
export async function saveServiceAsDraftAction(
  prevState: ServiceActionResponse | null,
  formData: FormData,
): Promise<ServiceActionResponse> {
  return createServiceInternal(prevState, formData, 'draft');
}

/**
 * Internal function to handle service creation with status
 */
async function createServiceInternal(
  prevState: ServiceActionResponse | null,
  formData: FormData,
  status: 'draft' | 'pending' = 'draft',
): Promise<ServiceActionResponse> {
  try {
    // 1. Get authenticated session
    const session = await requireAuth();
    const user = session.user;

    // 2. Check permissions - only freelancers and companies can create services
    if (user.role === 'user') {
      return {
        success: false,
        message:
          'Μόνο επαγγελματίες και επιχειρήσεις μπορούν να δημιουργήσουν υπηρεσίες',
      };
    }

    // 3. Get user profile using cached function
    const profileResult = await getProfileByUserId(user.id);

    if (!profileResult.success) {
      return {
        success: false,
        message: 'Σφάλμα κατά την ανάκτηση του προφίλ σας.',
      };
    }

    if (!profileResult.data) {
      return {
        success: false,
        message:
          'Δεν βρέθηκε το προφίλ σας. Παρακαλώ ολοκληρώστε πρώτα τη ρύθμιση του προφίλ σας.',
      };
    }

    const profile = profileResult.data;

    // 4. Rate limiting check for draft saves
    if (status === 'draft') {
      const now = new Date();
      const cooldownPeriod = 30 * 1000; // 30 seconds in milliseconds

      if (profile.lastServiceDraft) {
        const lastDraftDate = new Date(profile.lastServiceDraft);
        const timeSinceLastDraft = now.getTime() - lastDraftDate.getTime();
        if (timeSinceLastDraft < cooldownPeriod) {
          const remainingTime = Math.ceil(
            (cooldownPeriod - timeSinceLastDraft) / 1000,
          );
          return {
            success: false,
            message: `Μπορείτε να αποθηκεύσετε προσχέδιο ξανά σε ${remainingTime} δευτερόλεπτα.`,
          };
        }
      }
    }

    // 5. Extract form data using extractFormData utility
    const isDraft = status === 'draft';
    const { data: extractedData, errors: extractionErrors } = extractFormData(
      formData,
      {
        title: { type: 'string', required: !isDraft },
        description: { type: 'string', required: !isDraft },
        category: { type: 'string', required: !isDraft },
        subcategory: { type: 'string', required: !isDraft },
        subdivision: { type: 'string', required: !isDraft },
        subscriptionType: {
          type: 'string',
          required: false,
          defaultValue: undefined,
        },
        type: {
          type: 'json',
          required: !isDraft,
          defaultValue: {
            presence: false,
            online: false,
            oneoff: false,
            onbase: false,
            subscription: false,
            onsite: false,
          },
        },
        tags: { type: 'json', required: false, defaultValue: [] },
        addons: { type: 'json', required: false, defaultValue: [] },
        faq: { type: 'json', required: false, defaultValue: [] },
        media: { type: 'json', required: false, defaultValue: [] },
        price: { type: 'int', required: false, defaultValue: 0 },
        duration: { type: 'int', required: false, defaultValue: 0 },
        fixed: { type: 'boolean', required: false, defaultValue: true },
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

    // 5. Validate form data with appropriate Zod schema
    const validationSchema = isDraft
      ? createServiceDraftSchema
      : createServiceSchema;
    const validationResult = validationSchema.safeParse({
      type: extractedData.type,
      subscriptionType: extractedData.subscriptionType || undefined,
      title: extractedData.title,
      description: extractedData.description,
      category: extractedData.category,
      subcategory: extractedData.subcategory,
      subdivision: extractedData.subdivision,
      tags: extractedData.tags,
      price: extractedData.price,
      fixed: extractedData.fixed,
      duration: extractedData.duration || undefined,
      addons: extractedData.addons,
      faq: extractedData.faq,
      media: extractedData.media,
    });

    if (!validationResult.success) {
      return createValidationErrorResponse(
        validationResult.error,
        'Μη έγκυρα δεδομένα υπηρεσίας',
      );
    }

    const data = validationResult.data;

    // 6.5. Sanitize media resources before saving to database
    const sanitizedMedia = sanitizeCloudinaryResources(data.media || []);

    // 7. Type configuration is already in the correct Boolean structure from form
    const typeConfig = data.type;

    // 9. Create service in database - let Prisma auto-generate ID, then create slug
    let createdService: { id: number; title: string } | undefined;

    if (status === 'draft') {
      // Use transaction to create service with slug and update lastServiceDraft atomically
      createdService = await prisma.$transaction(async (tx) => {
        // Step 1: Create service without slug (auto-increment ID)
        const title = data.title || '';
        const description = data.description || '';

        const service = await tx.service.create({
          data: {
            pid: profile.id,
            title: title,
            titleNormalized: normalizeTerm(title),
            description: description,
            descriptionNormalized: normalizeTerm(description),
            category: data.category || '',
            subcategory: data.subcategory || '',
            subdivision: data.subdivision || '',
            tags: data.tags || [],
            price: data.price || 0,
            fixed: data.fixed ?? true,
            type: data.type || {
              presence: false,
              online: false,
              oneoff: false,
              onbase: false,
              subscription: false,
              onsite: false,
            },
            subscriptionType: data.subscriptionType || null,
            duration: data.duration || 0,
            addons: (data.addons || []).filter((addon): addon is { title: string; description: string; price: number } =>
              Boolean(addon.title && addon.description && addon.price !== undefined)
            ),
            faq: (data.faq || []).filter((faq): faq is { question: string; answer: string } =>
              Boolean(faq.question && faq.answer)
            ),
            media: sanitizedMedia,
            status: status,
            featured: false,
          },
          select: { id: true, title: true, description: true },
        });

        // Step 2: Generate slug with the auto-generated ID and update service
        const slug = generateServiceSlug(data.title || 'untitled', service.id.toString());
        await tx.service.update({
          where: { id: service.id },
          data: { slug },
        });

        // Step 3: Update profile's lastServiceDraft
        await tx.profile.update({
          where: { id: profile.id },
          data: { lastServiceDraft: new Date() },
        });

        return service;
      });
    } else {
      // Regular service creation (non-draft) with slug generation
      createdService = await prisma.$transaction(async (tx) => {
        // Step 1: Create service without slug (auto-increment ID)
        const title = data.title || '';
        const description = data.description || '';

        const service = await tx.service.create({
          data: {
            pid: profile.id,
            title: title,
            titleNormalized: normalizeTerm(title),
            description: description,
            descriptionNormalized: normalizeTerm(description),
            category: data.category || '',
            subcategory: data.subcategory || '',
            subdivision: data.subdivision || '',
            tags: data.tags || [],
            price: data.price || 0,
            fixed: data.fixed ?? true,
            type: data.type || {
              presence: false,
              online: false,
              oneoff: false,
              onbase: false,
              subscription: false,
              onsite: false,
            },
            subscriptionType: data.subscriptionType || null,
            duration: data.duration || 0,
            addons: (data.addons || []).filter((addon): addon is { title: string; description: string; price: number } =>
              Boolean(addon.title && addon.description && addon.price !== undefined)
            ),
            faq: (data.faq || []).filter((faq): faq is { question: string; answer: string } =>
              Boolean(faq.question && faq.answer)
            ),
            media: sanitizedMedia,
            status: status,
            featured: false,
          },
          select: { id: true, title: true, description: true },
        });

        // Step 2: Generate slug with the auto-generated ID and update service
        const slug = generateServiceSlug(data.title || 'untitled', service.id.toString());
        await tx.service.update({
          where: { id: service.id },
          data: { slug },
        });

        return service;
      });

      // Store the created service for returning in response
      // Now we have access to createdService outside the transaction

      // Send email notification to admin for new services (non-draft only)
      await sendServiceCreatedEmail(
        { ...createdService, description: data.description || '' },
        { ...user, email: user.email || '' }, // Ensure email is not undefined
        typeof profile.id === 'string' ? parseInt(profile.id) : profile.id,
        data.category
      );

      // Check if this is the user's first service and move to pros list
      // Only for non-draft services (status === 'pending' or 'published')
      const serviceCount = await prisma.service.count({
        where: {
          pid: profile.id,
          status: { not: 'draft' }, // Count only non-draft services
        },
      });

      if (serviceCount === 1 && user.email) {
        // This is the first service - move to pros list
        brevoWorkflowService
          .handleFirstServiceCreated(user.email, {
            DISPLAY_NAME: user.displayName || undefined,
            USERNAME: user.username || undefined,
            USER_TYPE: user.type as 'user' | 'pro', // Type assertion for literal type
            USER_ROLE: user.role as 'user' | 'freelancer' | 'company' | 'admin', // Type assertion for literal type
            IS_PRO: user.type === 'pro',
            SERVICES_COUNT: 1,
          })
          .catch((error) => {
            console.error('Failed to move user to pros list:', error);
            // Don't throw - this shouldn't block service creation
          });
      }
    }

    // 10. Media handling - now properly sanitizes pending resources before database storage

    // 11. Revalidate cached data with consistent tags
    // For draft services, only revalidate user/profile data
    if (status === 'draft') {
      revalidateTag(CACHE_TAGS.user.byId(user.id));
      revalidateTag(CACHE_TAGS.profile.byId(profile.id));
      revalidateTag(CACHE_TAGS.user.services(user.id));
      revalidateTag(CACHE_TAGS.profile.services(profile.id));
    } else if (createdService) {
      // For published services, get service data for comprehensive invalidation
      const serviceForTags = await prisma.service.findUnique({
        where: { id: createdService.id },
        select: {
          id: true,
          slug: true,
          pid: true,
          category: true,
        },
      });

      if (serviceForTags) {
        // Revalidate service-specific tags
        const serviceTags = getServiceTags(serviceForTags);
        serviceTags.forEach(tag => revalidateTag(tag));

        // Revalidate profile tags
        revalidateTag(CACHE_TAGS.profile.byId(profile.id));
        revalidateTag(CACHE_TAGS.user.byId(user.id));
        revalidateTag(CACHE_TAGS.user.services(user.id));
        revalidateTag(CACHE_TAGS.profile.services(profile.id));

        // Revalidate search caches (new service added)
        revalidateTag(CACHE_TAGS.search.all);
        revalidateTag(CACHE_TAGS.search.taxonomies);

        // Revalidate archive caches (new service affects listings)
        revalidateTag(CACHE_TAGS.archive.all);
        revalidateTag(CACHE_TAGS.archive.servicesFiltered);

        // Revalidate specific pages
        if (serviceForTags.slug) {
          revalidatePath(`/s/${serviceForTags.slug}`);
        }
        if (profile.username) {
          revalidatePath(`/profile/${profile.username}`);
        }
      }
    }

    // 12. Success response - let client handle navigation
    if (status === 'draft') {
      return {
        success: true,
        message: 'Η υπηρεσία αποθηκεύτηκε ως προσχέδιο επιτυχώς!',
      };
    } else {
      return {
        success: true,
        message: 'Η υπηρεσία υποβλήθηκε για έγκριση επιτυχώς!',
        serviceId: createdService!.id,
        serviceTitle: createdService!.title,
      };
    }
  } catch (error: any) {
    // 13. Comprehensive error handling
    console.error('Service creation error:', error);
    return handleBetterAuthError(error);
  }
}
