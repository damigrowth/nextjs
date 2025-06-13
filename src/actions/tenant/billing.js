'use server';

import { revalidatePath } from 'next/cache';

import { postData } from '@/lib/client/operations';
import { UPDATE_FREELANCER } from '@/lib/graphql';

import { billingSchema, billingSchemaOptional } from '../schema/billing';

export async function updateBillingDetails(prevState, formData) {
  const billing_details = JSON.parse(formData.get('billing_details'));

  const id = formData.get('id');

  // Choose validation schema based on invoice flag
  const validationSchema = billing_details.invoice
    ? billingSchema
    : billingSchemaOptional;

  // Validate billing details with the appropriate schema
  const validationResult = validationSchema.safeParse(billing_details);

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

  // Process the billing details, ensuring proper types
  const processedBillingDetails = {
    ...validationResult.data,
    // If AFM exists and isn't null, ensure it's a string
    ...(validationResult.data.afm !== null &&
      validationResult.data.afm !== undefined && {
        afm: validationResult.data.afm.toString(),
      }),
  };

  const payload = {
    billing_details: processedBillingDetails,
  };

  const response = await postData(UPDATE_FREELANCER, {
    id,
    data: payload,
  });

  // ✅ Check SUCCESS first  
  if (response?.data?.updateFreelancer?.data) {
    revalidatePath('/dashboard/profile');
    return {
      data: response.data.updateFreelancer.data,
      errors: null,
      message: 'Τα στοιχεία τιμολόγησης ενημερώθηκαν με επιτυχία',
    };
  }

  // ✅ Handle ERRORS from postData (Greek messages)
  if (response?.error) {
    return {
      data: null,
      errors: { submit: response.error }, // Greek error message from postData
      message: null,
    };
  }

  // ✅ Fallback if no data and no error
  return {
    data: null,
    errors: { submit: 'Αποτυχία ενημέρωσης στοιχείων. Δοκιμάστε ξανά.' },
    message: null,
  };
}
