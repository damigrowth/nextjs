// 'use server';

// import { auth } from '@/lib/auth';
// import { prisma } from '@/lib/prisma/client';
// import { revalidatePath } from 'next/cache';
// import { headers } from 'next/headers';

// type ActionResult<T = any> = {
//   success: boolean;
//   data?: T;
//   error?: string;
// };

// export async function deleteService(
//   serviceId: string,
// ): Promise<ActionResult<void>> {
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

//     // Check if service exists and belongs to user
//     const service = await prisma.service.findUnique({
//       where: { id: serviceId },
//       include: {
//         reviews: { select: { id: true } },
//         media: { select: { id: true } },
//       },
//     });

//     if (!service) {
//       return { success: false, error: 'Service not found' };
//     }

//     if (service.pid !== profile.id) {
//       return {
//         success: false,
//         error: 'Unauthorized: You can only delete your own services',
//       };
//     }

//     // Check if service has reviews (optional: prevent deletion if it has reviews)
//     if (service.reviews.length > 0) {
//       return {
//         success: false,
//         error:
//           'Cannot delete service with existing reviews. Please contact support if you need to remove this service.',
//       };
//     }

//     // Use transaction to safely delete service and related data
//     await prisma.$transaction(async (tx) => {
//       // Delete related media files first
//       if (service.media.length > 0) {
//         await tx.media.deleteMany({
//           where: { serviceMediaId: serviceId },
//         });
//       }

//       // Delete the service
//       await tx.service.delete({
//         where: { id: serviceId },
//       });
//     });

//     // Revalidate relevant pages
//     revalidatePath('/dashboard/services');
//     revalidatePath(`/profile/${profile.username}`);

//     return {
//       success: true,
//       data: undefined,
//     };
//   } catch (error) {
//     console.error('Delete service error:', error);
//     return {
//       success: false,
//       error:
//         error instanceof Error ? error.message : 'Failed to delete service',
//     };
//   }
// }

// // Soft delete - mark as unpublished instead of deleting
// export async function archiveService(
//   serviceId: string,
// ): Promise<ActionResult<void>> {
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

//     // Archive service (mark as unpublished)
//     await prisma.service.update({
//       where: { id: serviceId },
//       data: {
//         published: false,
//         // Optionally add an archived flag if you add it to schema later
//       },
//     });

//     revalidatePath('/dashboard/services');
//     revalidatePath(`/profile/${profile.username}`);

//     return {
//       success: true,
//       data: undefined,
//     };
//   } catch (error) {
//     console.error('Archive service error:', error);
//     return {
//       success: false,
//       error: 'Failed to archive service',
//     };
//   }
// }
