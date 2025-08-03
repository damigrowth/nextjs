// 'use server';

// import { auth } from '@/lib/auth';
// import { prisma } from '@/lib/prisma/client';
// import { revalidatePath } from 'next/cache';
// import { headers } from 'next/headers';
// import { z } from 'zod';

// const updateServiceSchema = z.object({
//   id: z.string(),
//   title: z
//     .string()
//     .min(1, 'Title is required')
//     .max(100, 'Title must be less than 100 characters')
//     .optional(),
//   description: z
//     .string()
//     .min(10, 'Description must be at least 10 characters')
//     .max(2000, 'Description must be less than 2000 characters')
//     .optional(),
//   price: z
//     .number()
//     .min(0, 'Price must be positive')
//     .max(100000, 'Price is too high')
//     .optional(),
//   category: z.string().min(1, 'Category is required').optional(),
//   subcategory: z.string().optional(),
//   tags: z.string().optional(),
//   pricingType: z.string().optional(),
//   duration: z.string().optional(),
//   location: z.string().optional(),
//   published: z.boolean().optional(),
//   featured: z.boolean().optional(),
// });

// type ActionResult<T = any> = {
//   success: boolean;
//   data?: T;
//   error?: string;
// };

// export async function updateService(
//   formData: FormData,
// ): Promise<ActionResult<{ serviceId: string }>> {
//   try {
//     // Check authentication
//     const session = await auth.api.getSession({
//       headers: await headers(),
//     });

//     if (!session?.user) {
//       return { success: false, error: 'Authentication required' };
//     }

//     // Parse service ID
//     const serviceId = formData.get('id')?.toString();
//     if (!serviceId) {
//       return { success: false, error: 'Service ID is required' };
//     }

//     // Get user profile
//     const profile = await prisma.profile.findUnique({
//       where: { uid: session.user.id },
//     });

//     if (!profile) {
//       return { success: false, error: 'Profile not found' };
//     }

//     // Check if service exists and belongs to user
//     const existingService = await prisma.service.findUnique({
//       where: { id: serviceId },
//       include: { profile: true },
//     });

//     if (!existingService) {
//       return { success: false, error: 'Service not found' };
//     }

//     if (existingService.pid !== profile.id) {
//       return {
//         success: false,
//         error: 'Unauthorized: You can only edit your own services',
//       };
//     }

//     // Build update data - only include fields that were provided
//     const updateData: any = {};

//     if (formData.get('title')) {
//       updateData.title = formData.get('title')?.toString();
//     }
//     if (formData.get('description')) {
//       updateData.description = formData.get('description')?.toString();
//     }
//     if (formData.get('price')) {
//       updateData.price = Number(formData.get('price'));
//     }
//     if (formData.get('category')) {
//       updateData.category = formData.get('category')?.toString();
//     }
//     if (formData.has('subcategory')) {
//       updateData.subcategory = formData.get('subcategory')?.toString() || null;
//     }
//     if (formData.has('tags')) {
//       updateData.tags = formData.get('tags')?.toString() || null;
//     }
//     if (formData.has('pricingType')) {
//       updateData.pricingType = formData.get('pricingType')?.toString() || null;
//     }
//     if (formData.has('duration')) {
//       updateData.duration = formData.get('duration')?.toString() || null;
//     }
//     if (formData.has('location')) {
//       updateData.location = formData.get('location')?.toString() || null;
//     }
//     if (formData.has('published')) {
//       updateData.published = formData.get('published') === 'true';
//     }
//     if (formData.has('featured')) {
//       updateData.featured = formData.get('featured') === 'true';
//     }

//     // Validate the update data
//     const validatedData = updateServiceSchema.parse({
//       id: serviceId,
//       ...updateData,
//     });

//     // Remove id from update data
//     delete validatedData.id;

//     // Update service
//     const updatedService = await prisma.service.update({
//       where: { id: serviceId },
//       data: validatedData,
//     });

//     // Revalidate relevant pages
//     revalidatePath('/dashboard/services');
//     revalidatePath(`/services/${serviceId}`);
//     revalidatePath(`/profile/${profile.username}`);

//     return {
//       success: true,
//       data: { serviceId: updatedService.id },
//     };
//   } catch (error) {
//     console.error('Update service error:', error);

//     if (error instanceof z.ZodError) {
//       return {
//         success: false,
//         error: error.errors.map((e) => e.message).join(', '),
//       };
//     }

//     return {
//       success: false,
//       error:
//         error instanceof Error ? error.message : 'Failed to update service',
//     };
//   }
// }

// // Toggle service published status
// export async function toggleServiceStatus(
//   serviceId: string,
// ): Promise<ActionResult<{ published: boolean }>> {
//   try {
//     // Check authentication
//     const session = await auth.api.getSession({
//       headers: await headers(),
//     });

//     if (!session?.user) {
//       return { success: false, error: 'Authentication required' };
//     }

//     // Get user profile
//     const profile = await prisma.profile.findUnique({
//       where: { uid: session.user.id },
//     });

//     if (!profile) {
//       return { success: false, error: 'Profile not found' };
//     }

//     // Check service ownership
//     const service = await prisma.service.findUnique({
//       where: { id: serviceId },
//     });

//     if (!service) {
//       return { success: false, error: 'Service not found' };
//     }

//     if (service.pid !== profile.id) {
//       return { success: false, error: 'Unauthorized' };
//     }

//     // Toggle published status
//     const updatedService = await prisma.service.update({
//       where: { id: serviceId },
//       data: { published: !service.published },
//     });

//     revalidatePath('/dashboard/services');
//     revalidatePath(`/profile/${profile.username}`);

//     return {
//       success: true,
//       data: { published: updatedService.published },
//     };
//   } catch (error) {
//     console.error('Toggle service status error:', error);
//     return {
//       success: false,
//       error: 'Failed to toggle service status',
//     };
//   }
// }
