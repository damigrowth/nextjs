'use server';

import { revalidateTag } from 'next/cache';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma/client';
import type { ActionResult } from '@/lib/types/api';
import { createServiceSchema } from '@/lib/validations/service';
import type { CreateServiceInput } from '@/lib/validations/service';

export async function updateServiceAction(
  serviceId: number,
  formData: FormData,
): Promise<ActionResult<{ message: string }>> {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { success: false, error: 'Authentication required' };
    }

    // Get user profile
    const profile = await prisma.profile.findUnique({
      where: { uid: session.user.id },
    });

    if (!profile) {
      return { success: false, error: 'Profile not found' };
    }

    // Check if service exists and belongs to user
    const existingService = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!existingService) {
      return { success: false, error: 'Service not found' };
    }

    if (existingService.pid !== profile.id) {
      return { success: false, error: 'Unauthorized access' };
    }

    // Extract and parse FormData
    const rawData = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      category: formData.get('category') as string,
      subcategory: formData.get('subcategory') as string,
      subdivision: formData.get('subdivision') as string,
      price: Number(formData.get('price')) || 0,
      fixed: formData.get('fixed') === 'true',
      duration: Number(formData.get('duration')) || 0,
      subscriptionType: formData.get('subscriptionType') as string || undefined,
      // Parse JSON fields
      type: formData.get('type') ? JSON.parse(formData.get('type') as string) : {},
      tags: formData.get('tags') ? JSON.parse(formData.get('tags') as string) : [],
      addons: formData.get('addons') ? JSON.parse(formData.get('addons') as string) : [],
      faq: formData.get('faq') ? JSON.parse(formData.get('faq') as string) : [],
      media: formData.get('media') ? JSON.parse(formData.get('media') as string) : [],
    };

    // Validate data
    const validationResult = createServiceSchema.safeParse(rawData);
    if (!validationResult.success) {
      console.error('Validation errors:', validationResult.error);
      return {
        success: false,
        error: 'Validation failed: ' + validationResult.error.issues.map(e => e.message).join(', '),
      };
    }

    const validData = validationResult.data;

    // Update service
    const updatedService = await prisma.service.update({
      where: { id: serviceId },
      data: {
        title: validData.title,
        description: validData.description,
        category: validData.category,
        subcategory: validData.subcategory,
        subdivision: validData.subdivision,
        tags: validData.tags || [],
        price: validData.price,
        fixed: validData.fixed,
        type: validData.type as any,
        subscriptionType: validData.subscriptionType || null,
        duration: validData.duration || 0,
        addons: (validData.addons || []) as any,
        faq: (validData.faq || []) as any,
        media: (validData.media || []) as any,
        updatedAt: new Date(),
      },
    });

    // Revalidate cached data
    revalidateTag(`user-services-${session.user.id}`);
    revalidateTag(`service-${serviceId}`);
    revalidateTag('services');

    return {
      success: true,
      message: 'Η υπηρεσία ενημερώθηκε επιτυχώς!',
      data: { message: 'Η υπηρεσία ενημερώθηκε επιτυχώς!' },
    } as any;
  } catch (error) {
    console.error('Update service error:', error);
    return {
      success: false,
      error: 'Failed to update service',
    };
  }
}