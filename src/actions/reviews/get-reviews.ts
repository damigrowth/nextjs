// 'use server';

// import { prisma } from '@/lib/prisma/client';

// type ActionResult<T = any> = {
//   success: boolean;
//   data?: T;
//   error?: string;
// };

// export type ReviewWithAuthor = {
//   id: string;
//   rating: number;
//   comment: string | null;
//   published: boolean;
//   createdAt: Date;
//   updatedAt: Date;
//   author: {
//     id: string;
//     name: string | null;
//     displayName: string | null;
//     username: string | null;
//     image: {
//       url: string;
//       alt: string | null;
//     } | null;
//   };
//   service?: {
//     id: string;
//     title: string;
//   };
// };

// // Get reviews for a profile
// export async function getProfileReviews(
//   profileId: string,
// ): Promise<ActionResult<ReviewWithAuthor[]>> {
//   try {
//     const reviews = await prisma.review.findMany({
//       where: {
//         pid: profileId,
//         published: true,
//       },
//       include: {
//         author: {
//           select: {
//             id: true,
//             name: true,
//             displayName: true,
//             username: true,
//           },
//         },
//         service: {
//           select: {
//             id: true,
//             title: true,
//           },
//         },
//       },
//       orderBy: { createdAt: 'desc' },
//     });

//     // Get author profile images
//     const reviewsWithImages = await Promise.all(
//       reviews.map(async (review) => {
//         const authorProfile = await prisma.profile.findUnique({
//           where: { uid: review.author.id },
//           select: {
//             image: {
//               select: {
//                 url: true,
//                 alt: true,
//               },
//             },
//           },
//         });

//         return {
//           ...review,
//           author: {
//             ...review.author,
//             image: authorProfile?.image || null,
//           },
//         };
//       }),
//     );

//     return {
//       success: true,
//       data: reviewsWithImages,
//     };
//   } catch (error) {
//     console.error('Get profile reviews error:', error);
//     return {
//       success: false,
//       error: 'Failed to fetch reviews',
//     };
//   }
// }

// // Get reviews for a service
// export async function getServiceReviews(
//   serviceId: string,
// ): Promise<ActionResult<ReviewWithAuthor[]>> {
//   try {
//     const reviews = await prisma.review.findMany({
//       where: {
//         sid: serviceId,
//         published: true,
//       },
//       include: {
//         author: {
//           select: {
//             id: true,
//             name: true,
//             displayName: true,
//             username: true,
//           },
//         },
//       },
//       orderBy: { createdAt: 'desc' },
//     });

//     // Get author profile images
//     const reviewsWithImages = await Promise.all(
//       reviews.map(async (review) => {
//         const authorProfile = await prisma.profile.findUnique({
//           where: { uid: review.author.id },
//           select: {
//             image: {
//               select: {
//                 url: true,
//                 alt: true,
//               },
//             },
//           },
//         });

//         return {
//           ...review,
//           author: {
//             ...review.author,
//             image: authorProfile?.image || null,
//           },
//         };
//       }),
//     );

//     return {
//       success: true,
//       data: reviewsWithImages,
//     };
//   } catch (error) {
//     console.error('Get service reviews error:', error);
//     return {
//       success: false,
//       error: 'Failed to fetch reviews',
//     };
//   }
// }

// // Get review statistics for a profile
// export async function getProfileReviewStats(profileId: string): Promise<
//   ActionResult<{
//     totalReviews: number;
//     averageRating: number;
//     ratingDistribution: { rating: number; count: number }[];
//   }>
// > {
//   try {
//     const reviews = await prisma.review.findMany({
//       where: {
//         pid: profileId,
//         published: true,
//       },
//       select: {
//         rating: true,
//       },
//     });

//     const totalReviews = reviews.length;
//     const averageRating =
//       totalReviews > 0
//         ? Number(
//             (
//               reviews.reduce((sum, review) => sum + review.rating, 0) /
//               totalReviews
//             ).toFixed(2),
//           )
//         : 0;

//     // Calculate rating distribution
//     const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
//     reviews.forEach((review) => {
//       ratingCounts[review.rating as keyof typeof ratingCounts]++;
//     });

//     const ratingDistribution = Object.entries(ratingCounts).map(
//       ([rating, count]) => ({
//         rating: Number(rating),
//         count,
//       }),
//     );

//     return {
//       success: true,
//       data: {
//         totalReviews,
//         averageRating,
//         ratingDistribution,
//       },
//     };
//   } catch (error) {
//     console.error('Get profile review stats error:', error);
//     return {
//       success: false,
//       error: 'Failed to fetch review statistics',
//     };
//   }
// }
