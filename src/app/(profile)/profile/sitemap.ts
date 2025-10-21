import type { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma/client';

// Revalidate every 1 hour to keep in sync with profile updates
export const revalidate = 3600;

/**
 * Generates sitemap for all published user profiles at /profile/[username]
 * Fetches directly from Prisma database for consistency with page.tsx
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl: string = process.env.LIVE_URL || 'https://doulitsa.gr';

  try {
    const profiles = await prisma.profile.findMany({
      where: {
        published: true,
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
