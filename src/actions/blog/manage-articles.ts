'use server';

import { prisma } from '@/lib/prisma/client';
import { revalidateArticle } from '@/lib/cache';
import { ADMIN_RESOURCES } from '@/lib/auth/roles';
import { getAdminSessionWithPermission } from '@/actions/admin/helpers';
import { createArticleSchema, updateArticleSchema } from '@/lib/validations/blog';
import { createSlug } from '@/lib/utils/text/slug';
import { normalizeTerm } from '@/lib/utils/text/normalize';
import { getBlogCategoryBySlug } from '@/constants/datasets/blog-categories';
import type { ActionResult } from '@/lib/types/api';
import type { BlogArticleAdmin } from '@/lib/types/blog';
import type { CreateArticleInput, UpdateArticleInput } from '@/lib/validations/blog';

/**
 * Create a new blog article (Admin/Support only)
 */
export async function createArticle(
  input: CreateArticleInput,
): Promise<ActionResult<{ id: string; slug: string }>> {
  try {
    await getAdminSessionWithPermission(ADMIN_RESOURCES.BLOG, 'edit');

    const validated = createArticleSchema.parse(input);

    // Validate categorySlug exists in static categories
    if (validated.categorySlug && !getBlogCategoryBySlug(validated.categorySlug)) {
      return { success: false, error: `Invalid category: ${validated.categorySlug}` };
    }

    // Validate author profiles exist
    if (validated.authorProfileIds?.length) {
      const existingProfiles = await prisma.profile.findMany({
        where: { id: { in: validated.authorProfileIds } },
        select: { id: true },
      });
      const existingIds = new Set(existingProfiles.map((p) => p.id));
      const missing = validated.authorProfileIds.filter((id) => !existingIds.has(id));
      if (missing.length > 0) {
        return { success: false, error: `Author profiles not found: ${missing.join(', ')}` };
      }
    }

    // Use provided slug or generate from title + timestamp suffix
    const slug = validated.slug || `${createSlug(validated.title)}-${Date.now().toString(36)}`;

    const article = await prisma.blogArticle.create({
      data: {
        slug,
        title: validated.title,
        titleNormalized: normalizeTerm(validated.title),
        excerpt: validated.excerpt || null,
        content: validated.content,
        coverImage: validated.coverImage || null,
        categorySlug: validated.categorySlug || null,
        status: validated.status,
        featured: validated.featured,
        publishedAt: validated.status === 'published' ? new Date() : null,
        ...(validated.authorProfileIds?.length
          ? {
              authors: {
                create: validated.authorProfileIds.map((profileId, index) => ({
                  profileId,
                  order: index,
                })),
              },
            }
          : {}),
      },
    });

    await revalidateArticle({
      articleId: article.id,
      slug: article.slug,
      categorySlug: article.categorySlug || '',
      authorProfileIds: validated.authorProfileIds || [],
    });

    return {
      success: true,
      data: { id: article.id, slug: article.slug },
    };
  } catch (error) {
    console.error('Error creating article:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create article',
    };
  }
}

/**
 * Update an existing blog article (Admin/Support only)
 */
export async function updateArticle(
  input: UpdateArticleInput,
): Promise<ActionResult<{ id: string; slug: string }>> {
  try {
    await getAdminSessionWithPermission(ADMIN_RESOURCES.BLOG, 'edit');

    const validated = updateArticleSchema.parse(input);
    const { id, authorProfileIds, ...updateData } = validated;

    // Validate categorySlug if provided
    if (updateData.categorySlug && !getBlogCategoryBySlug(updateData.categorySlug)) {
      return { success: false, error: `Invalid category: ${updateData.categorySlug}` };
    }

    // Validate author profiles if provided
    if (authorProfileIds?.length) {
      const existingProfiles = await prisma.profile.findMany({
        where: { id: { in: authorProfileIds } },
        select: { id: true },
      });
      const existingIds = new Set(existingProfiles.map((p) => p.id));
      const missing = authorProfileIds.filter((id) => !existingIds.has(id));
      if (missing.length > 0) {
        return { success: false, error: `Author profiles not found: ${missing.join(', ')}` };
      }
    }

    // Build update data
    const data: any = {};

    if (updateData.title !== undefined) {
      data.title = updateData.title;
      data.titleNormalized = normalizeTerm(updateData.title);
    }
    if (updateData.slug !== undefined && updateData.slug) data.slug = updateData.slug;
    if (updateData.excerpt !== undefined) data.excerpt = updateData.excerpt || null;
    if (updateData.content !== undefined) data.content = updateData.content;
    if (updateData.coverImage !== undefined) data.coverImage = updateData.coverImage || null;
    if (updateData.categorySlug !== undefined) data.categorySlug = updateData.categorySlug || null;
    if (updateData.featured !== undefined) data.featured = updateData.featured;

    if (updateData.status !== undefined) {
      data.status = updateData.status;
      // Set publishedAt when first published
      if (updateData.status === 'published') {
        const existing = await prisma.blogArticle.findUnique({
          where: { id },
          select: { publishedAt: true },
        });
        if (!existing?.publishedAt) {
          data.publishedAt = new Date();
        }
      }
    }

    // Update article
    const article = await prisma.blogArticle.update({
      where: { id },
      data,
    });

    // Update authors if provided
    if (authorProfileIds !== undefined) {
      // Delete existing author associations
      await prisma.blogArticleAuthor.deleteMany({
        where: { articleId: id },
      });
      // Create new ones
      await prisma.blogArticleAuthor.createMany({
        data: authorProfileIds.map((profileId, index) => ({
          articleId: id,
          profileId,
          order: index,
        })),
      });
    }

    await revalidateArticle({
      articleId: article.id,
      slug: article.slug,
      categorySlug: article.categorySlug,
      authorProfileIds: authorProfileIds || [],
    });

    return {
      success: true,
      data: { id: article.id, slug: article.slug },
    };
  } catch (error) {
    console.error('Error updating article:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update article',
    };
  }
}

/**
 * Delete a blog article (Admin/Support only)
 */
export async function deleteArticle(
  id: string,
): Promise<ActionResult<void>> {
  try {
    await getAdminSessionWithPermission(ADMIN_RESOURCES.BLOG, 'full');

    const article = await prisma.blogArticle.findUnique({
      where: { id },
      select: {
        id: true,
        slug: true,
        categorySlug: true,
        authors: { select: { profileId: true } },
      },
    });

    if (!article) {
      return { success: false, error: 'Article not found' };
    }

    await prisma.blogArticle.delete({ where: { id } });

    await revalidateArticle({
      articleId: article.id,
      slug: article.slug,
      categorySlug: article.categorySlug,
      authorProfileIds: article.authors.map((a) => a.profileId),
    });

    return { success: true };
  } catch (error) {
    console.error('Error deleting article:', error);
    return { success: false, error: 'Failed to delete article' };
  }
}

/**
 * List articles for admin (all statuses, with pagination and filters)
 */
export async function listArticlesAdmin(params?: {
  page?: number;
  limit?: number;
  status?: string;
  categorySlug?: string;
  search?: string;
}): Promise<
  ActionResult<{
    articles: BlogArticleAdmin[];
    total: number;
    totalPages: number;
  }>
> {
  try {
    await getAdminSessionWithPermission(ADMIN_RESOURCES.BLOG, 'view');

    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (params?.status) {
      where.status = params.status;
    }
    if (params?.categorySlug) {
      where.categorySlug = params.categorySlug;
    }
    if (params?.search) {
      where.OR = [
        { title: { contains: params.search, mode: 'insensitive' } },
        { titleNormalized: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    const [articles, total] = await Promise.all([
      prisma.blogArticle.findMany({
        where,
        include: {
          authors: {
            select: {
              profileId: true,
              order: true,
              profile: {
                select: {
                  id: true,
                  displayName: true,
                  image: true,
                  username: true,
                },
              },
            },
            orderBy: { order: 'asc' },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.blogArticle.count({ where }),
    ]);

    return {
      success: true,
      data: {
        articles,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error('Error listing articles:', error);
    return { success: false, error: 'Failed to list articles' };
  }
}

/**
 * Get a single article for admin editing (includes all fields)
 */
export async function getArticleAdmin(
  id: string,
): Promise<ActionResult<BlogArticleAdmin>> {
  try {
    await getAdminSessionWithPermission(ADMIN_RESOURCES.BLOG, 'view');

    const article = await prisma.blogArticle.findUnique({
      where: { id },
      include: {
        authors: {
          select: {
            profileId: true,
            order: true,
            profile: {
              select: {
                id: true,
                displayName: true,
                image: true,
                username: true,
              },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!article) {
      return { success: false, error: 'Article not found' };
    }

    return { success: true, data: article };
  } catch (error) {
    console.error('Error fetching article for admin:', error);
    return { success: false, error: 'Failed to fetch article' };
  }
}
