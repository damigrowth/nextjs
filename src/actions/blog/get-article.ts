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
