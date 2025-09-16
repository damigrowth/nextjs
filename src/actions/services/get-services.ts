'use server';

import { prisma } from '@/lib/prisma/client';
import { serviceTaxonomies } from '@/constants/datasets/service-taxonomies';
import { findById } from '@/lib/utils/datasets';
import type { ActionResult } from '@/lib/types/api';
import type { ServiceCardData } from '@/lib/types/components';
import type {
  ServiceWithProfile,
  ServicePaginationResponse,
} from '@/lib/types/services';
import { Prisma } from '@prisma/client';

// Transform service to component-ready format
function transformServiceForComponent(
  service: ServiceWithProfile,
): ServiceCardData {
  // Resolve category label for display
  const categoryTaxonomy = findById(serviceTaxonomies, service.category);

  return {
    id: service.id,
    title: service.title,
    category: categoryTaxonomy?.label,
    slug: service.slug, // Using ID as slug for now
    price: service.price,
    rating: service.rating,
    reviewCount: service.reviewCount,
    media: service.media, // Use media directly from Prisma JSON type
    profile: {
      id: service.profile.id,
      displayName: service.profile.displayName,
      username: service.profile.username,
      image: service.profile.image,
    },
  };
}

// Get 8 services for home page static generation
export async function getFeaturedServices(): Promise<
  ActionResult<ServiceCardData[]>
> {
  try {
    // Define the include object for reuse and type safety
    const includeProfile = {
      profile: {
        select: {
          id: true,
          username: true,
          displayName: true,
          firstName: true,
          lastName: true,
          rating: true,
          reviewCount: true,
          verified: true,
          image: true,
        },
      },
    } as const;

    // Get 8 services with fallback strategy
    let services = await prisma.service.findMany({
      where: {
        status: 'published',
        featured: true,
      },
      include: includeProfile,
      orderBy: [
        { rating: 'desc' },
        { reviewCount: 'desc' },
        { updatedAt: 'desc' },
      ],
      take: 8,
    });

    // If no featured services, get any published services
    if (services.length < 8) {
      const additionalServices = await prisma.service.findMany({
        where: {
          status: 'published',
          featured: false,
        },
        include: includeProfile,
        orderBy: [
          { rating: 'desc' },
          { reviewCount: 'desc' },
          { updatedAt: 'desc' },
        ],
        take: 8 - services.length,
      });

      services = [...services, ...additionalServices];
    }

    const transformedServices = services.map(transformServiceForComponent);

    return {
      success: true,
      data: transformedServices,
    };
  } catch (error) {
    console.error('Get services error:', error);
    return {
      success: false,
      error: 'Failed to fetch services',
    };
  }
}

// Get services with pagination for client-side pagination
export async function getServicesWithPagination(options?: {
  page?: number;
  limit?: number;
  category?: string;
  excludeFeatured?: boolean;
}): Promise<ActionResult<ServicePaginationResponse>> {
  try {
    const {
      page = 1,
      limit = 4,
      category,
      excludeFeatured = false,
    } = options || {};

    const offset = (page - 1) * limit;

    // Define the include object for reuse and type safety
    const includeProfile = {
      profile: {
        select: {
          id: true,
          username: true,
          displayName: true,
          firstName: true,
          lastName: true,
          rating: true,
          reviewCount: true,
          verified: true,
          image: true,
        },
      },
    } as const;

    // Build where clause with proper typing
    const where: Prisma.ServiceWhereInput = {
      status: 'published',
    };

    if (category && category !== 'all') {
      where.category = category;
    }

    if (excludeFeatured) {
      where.featured = false;
    }

    // Get services with count
    const [services, total] = await Promise.all([
      prisma.service.findMany({
        where,
        include: includeProfile,
        orderBy: [
          { featured: 'desc' },
          { rating: 'desc' },
          { reviewCount: 'desc' },
          { updatedAt: 'desc' },
        ],
        take: limit,
        skip: offset,
      }),
      prisma.service.count({ where }),
    ]);

    const transformedServices = services.map(transformServiceForComponent);
    const hasMore = offset + services.length < total;

    return {
      success: true,
      data: {
        services: transformedServices,
        total,
        hasMore,
      },
    };
  } catch (error) {
    console.error('Get services with pagination error:', error);
    return {
      success: false,
      error: 'Failed to fetch services',
    };
  }
}

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
