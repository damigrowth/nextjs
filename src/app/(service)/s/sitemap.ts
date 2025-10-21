import type { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma/client';

// Revalidate every 1 hour to keep in sync with service updates
export const revalidate = 3600;

/**
 * Generates sitemap for all published services at /s/[slug]
 * Fetches directly from Prisma database for consistency with page.tsx
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl: string = process.env.LIVE_URL || 'https://doulitsa.gr';

  try {
    const services = await prisma.service.findMany({
      where: {
        status: 'published',
        slug: { not: null },
      },
      select: {
        slug: true,
        updatedAt: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    // Map services to sitemap entries
    return services.map((service) => ({
      url: `${baseUrl}/s/${service.slug}`,
      lastModified: service.updatedAt,
    }));
  } catch (error) {
    console.error('Error generating services sitemap:', error);
    return [];
  }
}
