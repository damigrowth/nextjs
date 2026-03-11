'use server';

import { prisma } from '@/lib/prisma/client';
import { revalidateTag } from 'next/cache';
import { CACHE_TAGS } from '@/lib/cache';
import { ADMIN_RESOURCES } from '@/lib/auth/roles';
import { getAdminSessionWithPermission } from '@/actions/admin/helpers';
import {
  createBlogCategorySchema,
  updateBlogCategorySchema,
} from '@/lib/validations/blog';
import type { ActionResult } from '@/lib/types/api';
import type {
  CreateBlogCategoryInput,
  UpdateBlogCategoryInput,
} from '@/lib/validations/blog';

/**
 * Create a new blog category (Admin only)
 */
export async function createBlogCategory(
  input: CreateBlogCategoryInput,
): Promise<ActionResult<{ id: string }>> {
  try {
    await getAdminSessionWithPermission(ADMIN_RESOURCES.BLOG, 'edit');

    const validated = createBlogCategorySchema.parse(input);

    // Check for duplicate slug
    const existing = await prisma.blogCategory.findUnique({
      where: { slug: validated.slug },
    });
    if (existing) {
      return { success: false, error: 'Το slug υπάρχει ήδη' };
    }

    const category = await prisma.blogCategory.create({
      data: validated,
    });

    revalidateTag(CACHE_TAGS.blog.categories);

    return { success: true, data: { id: category.id } };
  } catch (error) {
    console.error('Error creating blog category:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create category',
    };
  }
}

/**
 * Update a blog category (Admin only)
 */
export async function updateBlogCategory(
  input: UpdateBlogCategoryInput,
): Promise<ActionResult<void>> {
  try {
    await getAdminSessionWithPermission(ADMIN_RESOURCES.BLOG, 'edit');

    const validated = updateBlogCategorySchema.parse(input);
    const { id, ...updateData } = validated;

    // Check slug uniqueness if changing
    if (updateData.slug) {
      const existing = await prisma.blogCategory.findFirst({
        where: { slug: updateData.slug, id: { not: id } },
      });
      if (existing) {
        return { success: false, error: 'Το slug υπάρχει ήδη' };
      }
    }

    await prisma.blogCategory.update({
      where: { id },
      data: updateData,
    });

    revalidateTag(CACHE_TAGS.blog.categories);
    revalidateTag(CACHE_TAGS.blog.articles);

    return { success: true };
  } catch (error) {
    console.error('Error updating blog category:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update category',
    };
  }
}

/**
 * Delete a blog category (Admin only)
 */
export async function deleteBlogCategory(
  id: string,
): Promise<ActionResult<void>> {
  try {
    await getAdminSessionWithPermission(ADMIN_RESOURCES.BLOG, 'full');

    // Check if category has articles
    const articleCount = await prisma.blogArticle.count({
      where: { categoryId: id },
    });

    if (articleCount > 0) {
      return {
        success: false,
        error: `Η κατηγορία περιέχει ${articleCount} άρθρα. Μεταφέρετε ή διαγράψτε τα πρώτα.`,
      };
    }

    await prisma.blogCategory.delete({ where: { id } });

    revalidateTag(CACHE_TAGS.blog.categories);

    return { success: true };
  } catch (error) {
    console.error('Error deleting blog category:', error);
    return { success: false, error: 'Failed to delete category' };
  }
}

/**
 * List all blog categories for admin
 */
export async function listBlogCategoriesAdmin(): Promise<ActionResult<any[]>> {
  try {
    await getAdminSessionWithPermission(ADMIN_RESOURCES.BLOG, 'view');

    const categories = await prisma.blogCategory.findMany({
      orderBy: { order: 'asc' },
      include: {
        _count: { select: { articles: true } },
      },
    });

    return { success: true, data: categories };
  } catch (error) {
    console.error('Error listing blog categories:', error);
    return { success: false, error: 'Failed to list categories' };
  }
}
