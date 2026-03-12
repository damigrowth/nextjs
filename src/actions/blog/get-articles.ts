'use server';

import { prisma } from '@/lib/prisma/client';
import type { ActionResult } from '@/lib/types/api';
import type { BlogArticleQuery } from '@/lib/validations/blog';

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
 * Get paginated articles for public archive pages
 */
export async function getArticles(
  params?: Partial<BlogArticleQuery>,
): Promise<
  ActionResult<{
    articles: any[];
    total: number;
    totalPages: number;
    hasMore: boolean;
  }>
> {
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
