'use server';

import { revalidatePath } from 'next/cache';

import { postData } from '@/lib/client/operations';
import { VERIFICATION } from '@/lib/graphql';

import { verificationFormSchema } from '../schema/verification';

export async function verificationUpdate(prevState, formData) {
  try {
    // Get form values directly - let the Zod schema handle coercion
    const fid = formData.get('fid');

    const email = formData.get('email');

    const afm = formData.get('afm');

    const brandName = formData.get('brandName');

    const address = formData.get('address');

    const phone = formData.get('phone');

    // Prepare the data for validation
    // The z.coerce in the schema will handle string-to-number conversion
    const fields = {
      afm,
      brandName,
      address,
      phone,
    };

    // Validate using Zod schema with coerce
    const validationResult = verificationFormSchema.safeParse(fields);

    if (!validationResult.success) {
      const fieldErrors = {};

      Object.entries(validationResult.error.flatten().fieldErrors).forEach(
        ([field, messages]) => {
          if (messages && messages.length > 0) {
            fieldErrors[field] = {
              field,
              message: messages[0],
            };
          }
        },
      );

      return {
        data: null,
        errors: fieldErrors,
        message: null,
      };
    }

    const validatedData = validationResult.data;

    // Make the API call with validated data
    // The schema already coerced string values to numbers where needed
    const data = await postData(VERIFICATION, {
      data: {
        afm: validatedData.afm,
        brandName: validatedData.brandName || '',
        address: validatedData.address || '',
        phone: validatedData.phone,
        email,
        status: 2,
        publishedAt: new Date(),
        freelancer: fid,
      },
    });

    // Check for successful response
    if (!data?.data?.createVerification?.data?.id) {
      return {
        data: null,
        errors: {
          submit: {
            field: 'submit',
            message: 'Αποτυχία αποστολής αίτησης πιστοποίησης. Δοκιμάστε ξανά.',
          },
        },
        message: null,
      };
    } else {
      revalidatePath('/dashboard/profile');

      return {
        data: data.data.createVerification.data,
        errors: null,
        message: 'Επιτυχία αποστολής αίτησης πιστοποίησης!',
      };
    }
  } catch (error) {
    console.error('Verification update failed:', error);

    return {
      data: null,
      errors: {
        submit: {
          field: 'submit',
          message:
            error.message ||
            'Προέκυψε σφάλμα κατά την επεξεργασία της αίτησης.',
        },
      },
      message: null,
    };
  }
}
