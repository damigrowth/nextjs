'use server';

import { revalidatePath } from 'next/cache';

import { postData } from '@/lib/client/operations';
import { EDIT_SERVICE } from '@/lib/graphql';

import { getToken } from '../auth/token';

export async function cancelService(prevState, formData) {
  const jwt = await getToken();

  const serviceId = formData.get('service-id');

  const payload = {
    id: serviceId,
    data: {
      status: 5, // Assuming 5 is the status code for canceled
    },
  };

  const response = await postData(EDIT_SERVICE, payload, jwt);

  // ✅ Check SUCCESS first
  if (response?.data?.updateService?.data) {
    revalidatePath(`/dashboard/services`);
    return {
      message: 'Η υπηρεσία διαγράφηκε με επιτυχία!',
      error: false,
      success: true,
    };
  }

  // ✅ Handle ERRORS from postData (Greek messages)
  if (response?.error) {
    return {
      message: response.error, // Greek error message from postData
      error: true,
      success: false,
    };
  }

  // ✅ Fallback if no data and no error
  return {
    message: 'Η διαγραφή της υπηρεσίας απέτυχε!',
    error: true,
    success: false,
  };
}
