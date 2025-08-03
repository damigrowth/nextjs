// 'use server';

// import { auth } from '@/lib/auth';
// import { prisma } from '@/lib/prisma/client';
// import { revalidatePath } from 'next/cache';
// import { headers } from 'next/headers';
// import { z } from 'zod';

// const createServiceSchema = z.object({
//   title: z
//     .string()
//     .min(1, 'Title is required')
//     .max(100, 'Title must be less than 100 characters'),
//   description: z
//     .string()
//     .min(10, 'Description must be at least 10 characters')
//     .max(2000, 'Description must be less than 2000 characters'),
//   price: z
//     .number()
//     .min(0, 'Price must be positive')
//     .max(100000, 'Price is too high'),
//   category: z.string().min(1, 'Category is required'),
//   subcategory: z.string().optional(),
//   tags: z.string().optional(),
//   pricingType: z.string().optional(),
//   duration: z.string().optional(),
//   location: z.string().optional(),
//   published: z.boolean().default(false),
// });

// type ActionResult<T = any> = {
//   success: boolean;
//   data?: T;
//   error?: string;
// };

// export async function createService(
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

//     // Get user profile (required for service creation)
//     const profile = await prisma.profile.findUnique({
//       where: { uid: session.user.id },
//     });

//     if (!profile) {
//       return {
//         success: false,
//         error: 'Profile not found. Please complete your profile first.',
//       };
//     }

//     // Validate and parse form data
//     const validatedData = createServiceSchema.parse({
//       title: formData.get('title')?.toString(),
//       description: formData.get('description')?.toString(),
//       price: Number(formData.get('price')),
//       category: formData.get('category')?.toString(),
//       subcategory: formData.get('subcategory')?.toString() || undefined,
//       tags: formData.get('tags')?.toString() || undefined,
//       pricingType: formData.get('pricingType')?.toString() || undefined,
//       duration: formData.get('duration')?.toString() || undefined,
//       location: formData.get('location')?.toString() || undefined,
//       published: formData.get('published') === 'true',
//     });

//     // Create service
//     const service = await prisma.service.create({
//       data: {
//         ...validatedData,
//         pid: profile.id,
//       },
//     });

//     // Revalidate relevant pages
//     revalidatePath('/dashboard/services');
//     revalidatePath(`/profile/${profile.username}`);

//     return {
//       success: true,
//       data: { serviceId: service.id },
//     };
//   } catch (error) {
//     console.error('Create service error:', error);

//     if (error instanceof z.ZodError) {
//       return {
//         success: false,
//         error: error.errors.map((e) => e.message).join(', '),
//       };
//     }

//     return {
//       success: false,
//       error:
//         error instanceof Error ? error.message : 'Failed to create service',
//     };
//   }
// }

// // Helper function to get service categories (can be moved to shared utilities later)
// export async function getServiceCategories(): Promise<string[]> {
//   try {
//     const categories = await prisma.service.findMany({
//       select: {
//         category: true,
//       },
//       distinct: ['category'],
//       orderBy: {
//         category: 'asc',
//       },
//     });

//     return categories.map((c) => c.category);
//   } catch (error) {
//     console.error('Get categories error:', error);
//     return [];
//   }
// }
