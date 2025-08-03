'use server';

import { PrismaClient, Prisma } from '@prisma/client';
import { ActionResult, ActionResponse } from '@/lib/types/api';
import { requireAuth, hasAnyRole } from '@/actions/auth/server';
import {
  profileBasicInfoUpdateSchema,
  type ProfileBasicInfoUpdateInput,
} from '@/lib/validations/profile';

const prisma = new PrismaClient();

/**
 * Update professional user profile
 * Only updates existing profiles - does not create new ones
 */
export async function updateProfileBasicInfo(
  input: ProfileBasicInfoUpdateInput,
): Promise<ActionResult<any>> {
  try {
    // Validate input
    const validatedInput = profileBasicInfoUpdateSchema.parse(input);

    // Require authentication
    const session = await requireAuth();

    // Check if user has permission to update profile (professionals only)
    const roleCheck = await hasAnyRole(['freelancer', 'company']);
    if (!roleCheck.success || !roleCheck.data) {
      return {
        success: false,
        error: 'Δεν έχετε δικαίωμα ενημέρωσης προφίλ',
      };
    }

    // Check if profile exists - we only update, never create
    const existingProfile = await prisma.profile.findUnique({
      where: { uid: session.user.id },
    });

    if (!existingProfile) {
      return {
        success: false,
        error:
          'Το προφίλ δεν βρέθηκε. Παρακαλώ ολοκληρώστε πρώτα την εγγραφή σας.',
      };
    }

    // Prepare profile data
    const profileData = {
      tagline: validatedInput.tagline,
      bio: validatedInput.bio,
      category: validatedInput.category,
      subcategory: validatedInput.subcategory,
      skills: validatedInput.skills || [],
      speciality: validatedInput.speciality,
      coverage: validatedInput.coverage as Prisma.JsonValue,
      image: validatedInput.image as Prisma.JsonValue,
      updatedAt: new Date(),
    };

    // Update profile
    const result = await prisma.profile.update({
      where: { uid: session.user.id },
      data: profileData,
    });

    return {
      success: true,
      data: result,
    };
  } catch (error: any) {
    console.error('Update profile error:', error);

    if (error.name === 'ZodError') {
      return {
        success: false,
        error: error.errors?.[0]?.message || 'Μη έγκυρα δεδομένα',
      };
    }

    return {
      success: false,
      error: error.message || 'Σφάλμα κατά την ενημέρωση του προφίλ',
    };
  }
}

/**
 * Server action wrapper for useActionState
 */
export const updateProfileBasicInfoActionAction = async (
  prevState: ActionResponse | null,
  data: FormData,
): Promise<ActionResponse> => {
  try {
    const entries = data.entries();
    const rawData = Object.fromEntries(entries) as Record<string, any>;

    // Parse JSON fields that might be stringified
    if (rawData.image && typeof rawData.image === 'string') {
      try {
        rawData.image = JSON.parse(rawData.image);
      } catch {
        rawData.image = null;
      }
    }

    if (rawData.skills && typeof rawData.skills === 'string') {
      try {
        rawData.skills = JSON.parse(rawData.skills);
      } catch {
        rawData.skills = [];
      }
    }

    if (rawData.coverage && typeof rawData.coverage === 'string') {
      try {
        rawData.coverage = JSON.parse(rawData.coverage);
      } catch {
        rawData.coverage = {};
      }
    }

    // Validate input data with zod schema
    const validatedData = profileBasicInfoUpdateSchema.safeParse(rawData);

    if (!validatedData.success) {
      return {
        success: false,
        message: 'Μη έγκυρα δεδομένα',
        errors: validatedData.error.flatten().fieldErrors,
        inputs: rawData,
      };
    }

    // Call the existing update profile function
    const result = await updateProfileBasicInfo(validatedData.data);

    if (!result.success) {
      return {
        success: false,
        message: result.error || 'Σφάλμα κατά την ενημέρωση προφίλ',
      };
    }

    return {
      success: true,
      message: 'Το προφίλ σας ενημερώθηκε επιτυχώς!',
    };
  } catch (error: any) {
    console.error('Profile update action error:', error);
    return {
      success: false,
      message:
        error.message || 'Αποτυχία ενημέρωσης προφίλ. Παρακαλώ δοκιμάστε ξανά.',
    };
  }
};
