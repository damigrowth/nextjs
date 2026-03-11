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
  featured: true,
  publishedAt: true,
  createdAt: true,
  viewCount: true,
  category: {
    select: {
      id: true,
      slug: true,
      label: true,
    },
  },
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
      where.category = { slug: params.categorySlug };
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

/**
 * Get all blog categories (ordered)
 */
export async function getBlogCategories(): Promise<ActionResult<any[]>> {
  try {
    const categories = await prisma.blogCategory.findMany({
      orderBy: { order: 'asc' },
      include: {
        _count: {
          select: { articles: { where: { status: 'published' } } },
        },
      },
    });

    return { success: true, data: categories };
  } catch (error) {
    console.error('Error fetching blog categories:', error);
    return { success: false, error: 'Failed to fetch categories' };
  }
}

/**
 * Get a single blog category by slug
 */
export async function getBlogCategoryBySlug(
  slug: string,
): Promise<ActionResult<any>> {
  try {
    const category = await prisma.blogCategory.findUnique({
      where: { slug },
    });

    if (!category) {
      return { success: false, error: 'Category not found' };
    }

    return { success: true, data: category };
  } catch (error) {
    console.error('Error fetching blog category:', error);
    return { success: false, error: 'Failed to fetch category' };
  }
}
