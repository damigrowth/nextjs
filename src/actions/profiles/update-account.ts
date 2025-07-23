'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { z } from 'zod';

import { accountUpdateSchema } from '@/lib/validations';
import { auth } from '@/lib/auth';
import { db } from '@/lib/database';
import { updateUserSchema } from '@/lib/validations/user';

export async function updateAccountInfo(prevState: any, formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        data: null,
        errors: {
          submit: { field: 'submit', message: 'Δεν είστε συνδεδεμένος' },
        },
        message: null,
      };
    }

    const changedFields = JSON.parse(
      (formData.get('changes') as string) || '{}',
    );
    const currentFormState = JSON.parse(
      (formData.get('currentFormState') as string) || '{}',
    );
    const type = formData.get('type') as string;
    const validateOnly = formData.get('validateOnly') === 'true';

    const isUser = type === 'user';

    // Handle explicit error from client
    if (formData.get('error')) {
      const error = JSON.parse(formData.get('error') as string);
      const errors: any = {};

      if (isUser) {
        errors.image = {
          field: 'image',
          message: error.message || 'Error processing image',
        };
      }
      errors.submit = {
        field: 'submit',
        message: error.message || 'Error processing request',
      };

      return { data: null, errors, message: null };
    }

    // Simplified validation for non-image fields
    const nonImageSchemaFields = { ...accountUpdateSchema.shape };
    delete nonImageSchemaFields.image;

    const partialNonImageSchema = z.object(
      Object.keys(changedFields).reduce((acc: any, field) => {
        if (
          nonImageSchemaFields[field as keyof typeof nonImageSchemaFields] &&
          field !== 'image'
        ) {
          acc[field] =
            nonImageSchemaFields[field as keyof typeof nonImageSchemaFields];
        }
        return acc;
      }, {}),
    );

    const nonImageDataToValidate = { ...changedFields };
    delete nonImageDataToValidate.image;

    const nonImageValidationResult = partialNonImageSchema.safeParse(
      nonImageDataToValidate,
    );

    if (!nonImageValidationResult.success) {
      const fieldErrors: any = {};

      Object.entries(
        nonImageValidationResult.error.flatten().fieldErrors,
      ).forEach(([field, messages]) => {
        if (messages && messages.length > 0) {
          fieldErrors[field] = { field, message: messages[0] };
        }
      });

      return { data: null, errors: fieldErrors, message: null };
    }

    if (validateOnly) {
      return { data: null, errors: {}, message: 'Validation passed' };
    }

    // Prepare payload
    const payload = { ...nonImageValidationResult.data };

    if (
      isUser &&
      (Object.hasOwn(changedFields, 'image') ||
        currentFormState.image !== undefined)
    ) {
      const imageId = currentFormState.image?.data?.id;
      payload.image = imageId || null;
    }

    // Update user in database
    const updatedUser = await db.user.update({
      where: { id: session.user.id },
      data: {
        ...(payload.name && { name: payload.name }),
        ...(payload.email && { email: payload.email }),
        ...(payload.phone && { phone: payload.phone }),
        ...(payload.image && { image: payload.image }),
        ...(payload.description && { description: payload.description }),
        ...(payload.location && { location: payload.location }),
        ...(payload.website && { website: payload.website }),
        ...(payload.facebook && { facebook: payload.facebook }),
        ...(payload.instagram && { instagram: payload.instagram }),
        ...(payload.twitter && { twitter: payload.twitter }),
        ...(payload.linkedin && { linkedin: payload.linkedin }),
      },
    });

    revalidatePath('/dashboard/profile');
    revalidateTag('user');

    return {
      data: updatedUser,
      errors: null,
      message: 'Τα στοιχεία ενημερώθηκαν με επιτυχία',
    };
  } catch (error) {
    console.error('Error updating account:', error);
    return {
      data: null,
      errors: {
        submit: {
          field: 'submit',
          message: 'Αποτυχία ενημέρωσης. Δοκιμάστε ξανά.',
        },
      },
      message: null,
    };
  }
}

export async function updateFreelancerAccount(
  data: z.infer<typeof updateUserSchema>,
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error('Not authenticated');
    }

    const validatedData = updateUserSchema.parse(data);

    const updatedUser = await db.user.update({
      where: { id: session.user.id },
      data: {
        ...validatedData,
        updatedAt: new Date(),
      },
    });

    revalidatePath('/dashboard/profile');
    revalidateTag('user');

    return { success: true, data: updatedUser };
  } catch (error) {
    console.error('Error updating freelancer account:', error);
    return { success: false, error: 'Failed to update account' };
  }
}
