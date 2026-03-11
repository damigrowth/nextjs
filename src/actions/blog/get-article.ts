'use server';

import { prisma } from '@/lib/prisma/client';
import type { ActionResult } from '@/lib/types/api';

/**
 * Full article data for detail page
 */
export async function getArticle(
  slug: string,
): Promise<ActionResult<any>> {
  try {
    const article = await prisma.blogArticle.findUnique({
      where: { slug },
      include: {
        category: true,
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

    // Get related articles (same category, exclude current)
    const relatedArticles = await prisma.blogArticle.findMany({
      where: {
        status: 'published',
        categoryId: article.categoryId,
        id: { not: article.id },
      },
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        coverImage: true,
        publishedAt: true,
        category: {
          select: { slug: true, label: true },
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
          orderBy: { order: 'asc' },
          take: 1,
        },
      },
      orderBy: { publishedAt: 'desc' },
      take: 3,
    });

    return {
      success: true,
      data: {
        article,
        relatedArticles,
      },
    };
  } catch (error) {
    console.error('Error fetching article:', error);
    return { success: false, error: 'Failed to fetch article' };
  }
}
