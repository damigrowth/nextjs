import type { MetadataRoute } from 'next';

// Revalidate every 1 hour to keep in sync with profile updates
export const revalidate = 3600;

/**
 * Generates sitemap for all published user profiles at /profile/[username]
 * Fetches directly from Prisma database for consistency with page.tsx
 * Uses dynamic import to avoid bundling Prisma client unnecessarily
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl: string = process.env.LIVE_URL || 'https://doulitsa.gr';

  try {
    const { prisma } = await import('@/lib/prisma/client');
    const profiles = await prisma.profile.findMany({
      where: {
        published: true,
        isActive: true,
        username: { not: null },
        user: {
          blocked: false,
          confirmed: true,
        },
      },
      select: {
        username: true,
        updatedAt: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return profiles.map((profile) => ({
      url: `${baseUrl}/profile/${profile.username}`,
      lastModified: profile.updatedAt,
    }));
  } catch (error) {
    console.error('Error generating profiles sitemap:', error);
    return [];
  }
}
