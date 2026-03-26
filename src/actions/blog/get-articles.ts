'use server';

import { unstable_cache } from 'next/cache';
import { prisma } from '@/lib/prisma/client';
import { getCacheTTL } from '@/lib/cache/config';
import { ArticleCacheKeys } from '@/lib/cache/keys';
import { CACHE_TAGS } from '@/lib/cache';
import type { ActionResult } from '@/lib/types/api';
import type { BlogArticleQuery } from '@/lib/validations/blog';
import type { BlogArticleCard, BlogArticlesResponse } from '@/lib/types/blog';

/**
 * Select fields for article cards (archive pages)
 */
const ARTICLE_CARD_SELECT = {
  id: true,
  slug: true,
  title: true,
  excerpt: true,
  coverImage: true,
  categorySlug: true,
  featured: true,
  publishedAt: true,
  createdAt: true,
  authors: {
    select: {
      order: true,
      profile: {
        select: {
          id: true,
          username: true,
          displayName: true,
          image: true,
        },
      },
    },
    orderBy: { order: 'asc' as const },
  },
} as const;

/**
 * Uncached: fetch paginated published articles
 */
async function _getArticles(
  params?: Partial<BlogArticleQuery>,
): Promise<ActionResult<BlogArticlesResponse>> {
  try {
    const page = params?.page || 1;
    const limit = params?.limit || 12;
    const skip = (page - 1) * limit;

    const where: any = {
      status: 'published',
    };

    if (params?.categorySlug) {
      where.categorySlug = params.categorySlug;
    }

    if (params?.authorProfileId) {
      where.authors = {
        some: { profileId: params.authorProfileId },
      };
    }

    if (params?.featured !== undefined) {
      where.featured = params.featured;
    }

    if (params?.search) {
      where.OR = [
        { titleNormalized: { contains: params.search, mode: 'insensitive' } },
        { title: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    const [articles, total] = await Promise.all([
      prisma.blogArticle.findMany({
        where,
        select: ARTICLE_CARD_SELECT,
        orderBy: { publishedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.blogArticle.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      data: {
        articles,
        total,
        totalPages,
        hasMore: total > skip + limit,
      },
    };
  } catch (error) {
    console.error('Error fetching articles:', error);
    return { success: false, error: 'Failed to fetch articles' };
  }
}

/**
 * Cached: get paginated articles for public archive pages
 */
export async function getArticles(
  params?: Partial<BlogArticleQuery>,
): Promise<ActionResult<BlogArticlesResponse>> {
  const tags: string[] = [CACHE_TAGS.blog.articles];
  if (params?.categorySlug) {
    tags.push(CACHE_TAGS.article.byCategory(params.categorySlug));
  }

  const getCached = unstable_cache(
    _getArticles,
    ArticleCacheKeys.archive({
      categorySlug: params?.categorySlug,
      page: params?.page,
      limit: params?.limit,
    }),
    {
      tags,
      revalidate: getCacheTTL('ARTICLE_ARCHIVE'),
    },
  );

  return getCached(params);
}

/**
 * Uncached: fetch related articles in the same category
 */
async function _getRelatedArticles(
  categorySlug: string,
  excludeSlug: string,
  limit: number,
): Promise<BlogArticleCard[]> {
  const articles = await prisma.blogArticle.findMany({
    where: {
      status: 'published',
      categorySlug,
      slug: { not: excludeSlug },
    },
    select: ARTICLE_CARD_SELECT,
    orderBy: { publishedAt: 'desc' },
    take: limit,
  });

  return articles;
}

/**
 * Cached: get related articles for article detail page
 */
export async function getRelatedArticles(
  categorySlug: string,
  excludeSlug: string,
  limit = 4,
): Promise<ActionResult<BlogArticleCard[]>> {
  try {
    const getCached = unstable_cache(
      _getRelatedArticles,
      ArticleCacheKeys.related({ categorySlug, excludeSlug }),
      {
        tags: [
          CACHE_TAGS.article.byCategory(categorySlug),
          CACHE_TAGS.blog.articles,
        ],
        revalidate: getCacheTTL('ARTICLE_ARCHIVE'),
      },
    );

    const articles = await getCached(categorySlug, excludeSlug, limit);
    return { success: true, data: articles };
  } catch (error) {
    console.error('Error fetching related articles:', error);
    return { success: false, error: 'Failed to fetch related articles' };
  }
}
