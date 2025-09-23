// 'use server';

// import { auth } from '@/lib/auth';
// import { prisma } from '@/lib/prisma/client';
// import { revalidatePath } from 'next/cache';
// import { headers } from 'next/headers';
// import { z } from 'zod';

// const createReviewSchema = z.object({
//   rating: z
//     .number()
//     .min(1, 'Rating must be at least 1')
//     .max(5, 'Rating must be at most 5'),
//   comment: z
//     .string()
//     .min(10, 'Comment must be at least 10 characters')
//     .max(1000, 'Comment must be less than 1000 characters')
//     .optional(),
//   profileId: z.string().min(1, 'Profile ID is required'),
//   serviceId: z.string().optional(), // Optional - can review profile directly
// });

// type ActionResult<T = any> = {
//   success: boolean;
//   data?: T;
//   error?: string;
// };

// export async function createReview(
//   formData: FormData,
// ): Promise<ActionResult<{ reviewId: string }>> {
//   try {
//     // Check authentication
//     const session = await auth.api.getSession({
//       headers: await headers(),
//     });

//     if (!session?.user) {
//       return { success: false, error: 'Authentication required' };
//     }

//     // Validate and parse form data
//     const validatedData = createReviewSchema.parse({
//       rating: Number(formData.get('rating')),
//       comment: formData.get('comment')?.toString() || undefined,
//       profileId: formData.get('profileId')?.toString(),
//       serviceId: formData.get('serviceId')?.toString() || undefined,
//     });

//     // Check if target profile exists
//     const targetProfile = await prisma.profile.findUnique({
//       where: { id: validatedData.profileId },
//       include: { user: { select: { id: true } } },
//     });

//     if (!targetProfile) {
//       return { success: false, error: 'Profile not found' };
//     }

//     // Prevent self-review
//     if (targetProfile.user.id === session.user.id) {
//       return { success: false, error: 'You cannot review yourself' };
//     }

//     // If serviceId provided, verify it belongs to the profile
//     if (validatedData.serviceId) {
//       const service = await prisma.service.findUnique({
//         where: { id: validatedData.serviceId },
//       });

//       if (!service || service.pid !== validatedData.profileId) {
//         return {
//           success: false,
//           error: 'Service not found or does not belong to this profile',
//         };
//       }
//     }

//     // Check if user already reviewed this profile/service
//     const existingReview = await prisma.review.findFirst({
//       where: {
//         authorId: session.user.id,
//         pid: validatedData.profileId,
//         ...(validatedData.serviceId && { sid: validatedData.serviceId }),
//       },
//     });

//     if (existingReview) {
//       return {
//         success: false,
//         error: validatedData.serviceId
//           ? 'You have already reviewed this service'
//           : 'You have already reviewed this profile',
//       };
//     }

//     // Create review within transaction to update ratings
//     const result = await prisma.$transaction(async (tx) => {
//       // Create the review
//       const review = await tx.review.create({
//         data: {
//           rating: validatedData.rating,
//           comment: validatedData.comment,
//           pid: validatedData.profileId,
//           sid: validatedData.serviceId,
//           authorId: session.user.id,
//           published: true,
//         },
//       });

//       // Update profile rating
//       const profileReviews = await tx.review.findMany({
//         where: { pid: validatedData.profileId },
//         select: { rating: true },
//       });

//       const avgRating =
//         profileReviews.reduce((sum, review) => sum + review.rating, 0) /
//         profileReviews.length;

//       await tx.profile.update({
//         where: { id: validatedData.profileId },
//         data: {
//           rating: Number(avgRating.toFixed(2)),
//           reviewCount: profileReviews.length,
//         },
//       });

//       // If service review, update service rating too
//       if (validatedData.serviceId) {
//         const serviceReviews = await tx.review.findMany({
//           where: { sid: validatedData.serviceId },
//           select: { rating: true },
//         });

//         const serviceAvgRating =
//           serviceReviews.reduce((sum, review) => sum + review.rating, 0) /
//           serviceReviews.length;

//         await tx.service.update({
//           where: { id: validatedData.serviceId },
//           data: {
//             rating: Number(serviceAvgRating.toFixed(2)),
//             reviewCount: serviceReviews.length,
//           },
//         });
//       }

//       return review;
//     });

//     // Revalidate relevant pages
//     revalidatePath(`/profile/${targetProfile.username}`);
//     if (validatedData.serviceId) {
//       revalidatePath(`/ipiresies/${validatedData.serviceId}`);
//     }

//     return {
//       success: true,
//       data: { reviewId: result.id },
//     };
//   } catch (error) {
//     console.error('Create review error:', error);

//     if (error instanceof z.ZodError) {
//       return {
//         success: false,
//         error: error.errors.map((e) => e.message).join(', '),
//       };
//     }

//     return {
//       success: false,
//       error: error instanceof Error ? error.message : 'Failed to create review',
//     };
//   }
// }

// // Check if user can review a profile/service
// export async function canUserReview(
//   profileId: string,
//   serviceId?: string,
// ): Promise<ActionResult<{ canReview: boolean; reason?: string }>> {
//   try {
//     // Check authentication
//     const session = await auth.api.getSession({
//       headers: await headers(),
//     });

//     if (!session?.user) {
//       return {
//         success: true,
//         data: { canReview: false, reason: 'Authentication required' },
//       };
//     }

//     // Check if target profile exists
//     const targetProfile = await prisma.profile.findUnique({
//       where: { id: profileId },
//       include: { user: { select: { id: true } } },
//     });

//     if (!targetProfile) {
//       return {
//         success: true,
//         data: { canReview: false, reason: 'Profile not found' },
//       };
//     }

//     // Prevent self-review
//     if (targetProfile.user.id === session.user.id) {
//       return {
//         success: true,
//         data: { canReview: false, reason: 'Cannot review yourself' },
//       };
//     }

//     // Check for existing review
//     const existingReview = await prisma.review.findFirst({
//       where: {
//         authorId: session.user.id,
//         pid: profileId,
//         ...(serviceId && { sid: serviceId }),
//       },
//     });

//     if (existingReview) {
//       return {
//         success: true,
//         data: {
//           canReview: false,
//           reason: serviceId
//             ? 'Already reviewed this service'
//             : 'Already reviewed this profile',
//         },
//       };
//     }

//     return {
//       success: true,
//       data: { canReview: true },
//     };
//   } catch (error) {
//     console.error('Can user review error:', error);
//     return {
//       success: false,
//       error: 'Failed to check review permission',
//     };
//   }
// }
