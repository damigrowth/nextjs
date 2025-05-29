'use server';

import { revalidatePath } from 'next/cache';

import { postData } from '@/lib/client/operations';
import { UPDATE_FREELANCER } from '@/lib/graphql';

export async function updateFreelancerStatus(id) {
  try {
    const { data, error } = await postData(UPDATE_FREELANCER, {
      id,
      data: {
        status: 1,
      },
    });

    if (error) throw error;
    // revalidatePath('/dashboard/profile');

    return data;
  } catch (error) {
    console.error('Status update failed:', error);
    throw error;
  }
}
