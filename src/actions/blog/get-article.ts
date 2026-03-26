'use server';

import { unstable_cache } from 'next/cache';
import { prisma } from '@/lib/prisma/client';
import { getCacheTTL } from '@/lib/cache/config';
import { ArticleCacheKeys } from '@/lib/cache/keys';
import { CACHE_TAGS } from '@/lib/cache';
import type { ActionResult } from '@/lib/types/api';
import type { BlogArticleDetail } from '@/lib/types/blog';

/**
 * Uncached: fetch a published article by slug
 */
async function _getArticle(
  slug: string,
): Promise<ActionResult<BlogArticleDetail>> {
  try {
    const article = await prisma.blogArticle.findUnique({
      where: { slug },
      include: {
        authors: {
          select: {
            order: true,
            profile: {
              select: {
                id: true,
                username: true,
                displayName: true,
                image: true,
                authorBio: true,
              },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!article || article.status !== 'published') {
      return { success: false, error: 'Article not found' };
    }

    return {
      success: true,
      data: article,
    };
  } catch (error) {
    console.error('Error fetching article:', error);
    return { success: false, error: 'Failed to fetch article' };
  }
}

/**
 * Cached: full article data for detail page
 */
export async function getArticle(
  slug: string,
): Promise<ActionResult<BlogArticleDetail>> {
  const getCached = unstable_cache(
    _getArticle,
    ArticleCacheKeys.detail(slug),
    {
      tags: [
        CACHE_TAGS.article.bySlug(slug),
        CACHE_TAGS.blog.articles,
      ],
      revalidate: getCacheTTL('ARTICLE_PAGE'),
    },
  );

  return getCached(slug);
}
