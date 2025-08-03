// 'use server';

// import { auth } from '@/lib/auth';
// import { prisma } from '@/lib/prisma/client';
// import { headers } from 'next/headers';

// type ActionResult<T = any> = {
//   success: boolean;
//   data?: T;
//   error?: string;
// };

// export type ServiceWithDetails = {
//   id: string;
//   title: string;
//   description: string;
//   price: number;
//   category: string;
//   subcategory: string | null;
//   tags: string | null;
//   pricingType: string | null;
//   duration: string | null;
//   location: string | null;
//   published: boolean;
//   featured: boolean;
//   rating: number;
//   reviewCount: number;
//   createdAt: Date;
//   updatedAt: Date;
//   profile: {
//     id: string;
//     username: string | null;
//     displayName: string | null;
//     firstName: string | null;
//     lastName: string | null;
//     rating: number;
//     reviewCount: number;
//     verified: boolean;
//     image: {
//       url: string;
//       alt: string | null;
//     } | null;
//   };
//   media: {
//     id: string;
//     url: string;
//     alt: string | null;
//   }[];
// };

// // Get user's own services
// export async function getMyServices(): Promise<
//   ActionResult<ServiceWithDetails[]>
// > {
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

//     // Get user's services
//     const services = await prisma.service.findMany({
//       where: { pid: profile.id },
//       include: {
//         profile: {
//           select: {
//             id: true,
//             username: true,
//             displayName: true,
//             firstName: true,
//             lastName: true,
//             rating: true,
//             reviewCount: true,
//             verified: true,
//             image: {
//               select: {
//                 url: true,
//                 alt: true,
//               },
//             },
//           },
//         },
//         media: {
//           select: {
//             id: true,
//             url: true,
//             alt: true,
//           },
//         },
//       },
//       orderBy: { updatedAt: 'desc' },
//     });

//     return {
//       success: true,
//       data: services,
//     };
//   } catch (error) {
//     console.error('Get my services error:', error);
//     return {
//       success: false,
//       error: 'Failed to fetch services',
//     };
//   }
// }

// // Get published services (public)
// export async function getPublishedServices(options?: {
//   category?: string;
//   search?: string;
//   limit?: number;
//   offset?: number;
//   featured?: boolean;
// }): Promise<ActionResult<{ services: ServiceWithDetails[]; total: number }>> {
//   try {
//     const {
//       category,
//       search,
//       limit = 12,
//       offset = 0,
//       featured,
//     } = options || {};

//     // Build where clause
//     const where: any = {
//       published: true,
//     };

//     if (category) {
//       where.category = category;
//     }

//     if (featured !== undefined) {
//       where.featured = featured;
//     }

//     if (search) {
//       where.OR = [
//         { title: { contains: search, mode: 'insensitive' } },
//         { description: { contains: search, mode: 'insensitive' } },
//         { tags: { contains: search, mode: 'insensitive' } },
//       ];
//     }

//     // Get services with count
//     const [services, total] = await Promise.all([
//       prisma.service.findMany({
//         where,
//         include: {
//           profile: {
//             select: {
//               id: true,
//               username: true,
//               displayName: true,
//               firstName: true,
//               lastName: true,
//               rating: true,
//               reviewCount: true,
//               verified: true,
//               image: {
//                 select: {
//                   url: true,
//                   alt: true,
//                 },
//               },
//             },
//           },
//           media: {
//             select: {
//               id: true,
//               url: true,
//               alt: true,
//             },
//             take: 3, // Limit media per service for performance
//           },
//         },
//         orderBy: [
//           { featured: 'desc' },
//           { rating: 'desc' },
//           { updatedAt: 'desc' },
//         ],
//         take: limit,
//         skip: offset,
//       }),
//       prisma.service.count({ where }),
//     ]);

//     return {
//       success: true,
//       data: { services, total },
//     };
//   } catch (error) {
//     console.error('Get published services error:', error);
//     return {
//       success: false,
//       error: 'Failed to fetch services',
//     };
//   }
// }

// // Get single service by ID
// export async function getService(
//   serviceId: string,
// ): Promise<ActionResult<ServiceWithDetails>> {
//   try {
//     const service = await prisma.service.findUnique({
//       where: { id: serviceId },
//       include: {
//         profile: {
//           select: {
//             id: true,
//             username: true,
//             displayName: true,
//             firstName: true,
//             lastName: true,
//             rating: true,
//             reviewCount: true,
//             verified: true,
//             image: {
//               select: {
//                 url: true,
//                 alt: true,
//               },
//             },
//           },
//         },
//         media: {
//           select: {
//             id: true,
//             url: true,
//             alt: true,
//           },
//         },
//       },
//     });

//     if (!service || !service.published) {
//       return { success: false, error: 'Service not found' };
//     }

//     return {
//       success: true,
//       data: service,
//     };
//   } catch (error) {
//     console.error('Get service error:', error);
//     return {
//       success: false,
//       error: 'Failed to fetch service',
//     };
//   }
// }

// // Get services by profile username
// export async function getServicesByProfile(
//   username: string,
// ): Promise<ActionResult<ServiceWithDetails[]>> {
//   try {
//     const services = await prisma.service.findMany({
//       where: {
//         published: true,
//         profile: {
//           username: username,
//         },
//       },
//       include: {
//         profile: {
//           select: {
//             id: true,
//             username: true,
//             displayName: true,
//             firstName: true,
//             lastName: true,
//             rating: true,
//             reviewCount: true,
//             verified: true,
//             image: {
//               select: {
//                 url: true,
//                 alt: true,
//               },
//             },
//           },
//         },
//         media: {
//           select: {
//             id: true,
//             url: true,
//             alt: true,
//           },
//         },
//       },
//       orderBy: [
//         { featured: 'desc' },
//         { rating: 'desc' },
//         { updatedAt: 'desc' },
//       ],
//     });

//     return {
//       success: true,
//       data: services,
//     };
//   } catch (error) {
//     console.error('Get services by profile error:', error);
//     return {
//       success: false,
//       error: 'Failed to fetch services',
//     };
//   }
// }
