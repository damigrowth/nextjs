import type { MetadataRoute } from 'next';

/**
 * Generates sitemap for static pages and archive index pages
 * All pages are verified to exist in the app structure
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl: string = process.env.LIVE_URL || 'https://doulitsa.gr';

  const staticPaths: string[] = [
    'about',
    'contact',
    'faq',
    'privacy',
    'terms',
    'login',
    'register',
    'for-pros',
    'categories',
    'ipiresies',
    'pros',
    'companies',
  ];

  const staticUrls: MetadataRoute.Sitemap = staticPaths.map((path) => ({
    url: `${baseUrl}/${path}`,
    lastModified: new Date(),
  }));

  const allUrls: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
    },
    ...staticUrls,
  ];

  return allUrls;
}
