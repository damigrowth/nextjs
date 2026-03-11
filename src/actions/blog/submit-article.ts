'use server';

import { prisma } from '@/lib/prisma/client';
import { requireAuth } from '@/actions/auth/server';
import { revalidateArticle } from '@/lib/cache';
import { createSlug } from '@/lib/utils/text/slug';
import { normalizeTerm } from '@/lib/utils/text/normalize';
import {
  submitArticleSchema,
  updateSubmittedArticleSchema,
} from '@/lib/validations/blog';
import type { ActionResult } from '@/lib/types/api';
import type {
  SubmitArticleInput,
  UpdateSubmittedArticleInput,
} from '@/lib/validations/blog';

/**
 * Helper: get the current user's profile and verify active subscription
 */
async function getSubscribedProfile(userId: string) {
  const profile = await prisma.profile.findUnique({
    where: { uid: userId },
    select: { id: true },
  });

  if (!profile) {
    return { error: 'Δεν βρέθηκε προφίλ' };
  }

  const subscription = await prisma.subscription.findUnique({
    where: { pid: profile.id },
    select: { plan: true, status: true },
  });

  if (!subscription || subscription.plan !== 'promoted' || subscription.status !== 'active') {
    return { error: 'Απαιτείται ενεργή συνδρομή για υποβολή άρθρων' };
  }

  return { profile };
}

/**
 * Submit a new article (paid subscribers only)
 */
export async function submitArticle(
  input: SubmitArticleInput,
): Promise<ActionResult<{ articleId: string }>> {
  try {
    const session = await requireAuth();
    const userId = session.user.id;

    const result = await getSubscribedProfile(userId);
    if ('error' in result) {
      return { success: false, error: result.error };
    }
    const { profile } = result;

    const validated = submitArticleSchema.parse(input);

    const baseSlug = createSlug(validated.title);
    const slug = `${baseSlug}-${Date.now().toString(36)}`;

    const article = await prisma.blogArticle.create({
      data: {
        slug,
        title: validated.title,
        titleNormalized: normalizeTerm(validated.title),
        excerpt: validated.excerpt || null,
        content: validated.content,
        coverImage: validated.coverImage || null,
        categoryId: validated.categoryId,
        tags: validated.tags || [],
        status: 'pending',
        featured: false,
        publishedAt: null,
        authors: {
          create: [{ profileId: profile.id, order: 0 }],
        },
      },
    });

    await revalidateArticle({
      articleId: article.id,
      slug: article.slug,
      categoryId: article.categoryId,
      authorProfileIds: [profile.id],
    });

    return {
      success: true,
      data: { articleId: article.id },
    };
  } catch (error) {
    console.error('Error submitting article:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Αποτυχία υποβολής άρθρου',
    };
  }
}

/**
 * Get current user's submitted articles
 */
export async function getMyArticles(): Promise<ActionResult<any[]>> {
  try {
    const session = await requireAuth();
    const userId = session.user.id;

    const profile = await prisma.profile.findUnique({
      where: { uid: userId },
      select: { id: true },
    });

    if (!profile) {
      return { success: true, data: [] };
    }

    const articles = await prisma.blogArticle.findMany({
      where: {
        authors: { some: { profileId: profile.id } },
      },
      select: {
        id: true,
        slug: true,
        title: true,
        status: true,
        publishedAt: true,
        createdAt: true,
        category: {
          select: { slug: true, label: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return { success: true, data: articles };
  } catch (error) {
    console.error('Error fetching my articles:', error);
    return { success: false, error: 'Αποτυχία φόρτωσης άρθρων' };
  }
}

/**
 * Update own article (only if draft or pending)
 */
export async function updateMyArticle(
  input: UpdateSubmittedArticleInput,
): Promise<ActionResult<{ articleId: string }>> {
  try {
    const session = await requireAuth();
    const userId = session.user.id;

    const profile = await prisma.profile.findUnique({
      where: { uid: userId },
      select: { id: true },
    });

    if (!profile) {
      return { success: false, error: 'Δεν βρέθηκε προφίλ' };
    }

    const validated = updateSubmittedArticleSchema.parse(input);
    const { id, ...updateData } = validated;

    // Verify ownership
    const authorLink = await prisma.blogArticleAuthor.findFirst({
      where: { articleId: id, profileId: profile.id },
    });

    if (!authorLink) {
      return { success: false, error: 'Δεν έχετε δικαίωμα επεξεργασίας αυτού του άρθρου' };
    }

    // Verify article is not published
    const existing = await prisma.blogArticle.findUnique({
      where: { id },
      select: { status: true },
    });

    if (!existing) {
      return { success: false, error: 'Το άρθρο δεν βρέθηκε' };
    }

    if (existing.status === 'published') {
      return { success: false, error: 'Δεν μπορείτε να επεξεργαστείτε δημοσιευμένο άρθρο' };
    }

    // Build update payload
    const data: any = {};
    if (updateData.title !== undefined) {
      data.title = updateData.title;
      data.titleNormalized = normalizeTerm(updateData.title);
    }
    if (updateData.excerpt !== undefined) data.excerpt = updateData.excerpt || null;
    if (updateData.content !== undefined) data.content = updateData.content;
    if (updateData.coverImage !== undefined) data.coverImage = updateData.coverImage || null;
    if (updateData.categoryId !== undefined) data.categoryId = updateData.categoryId;
    if (updateData.tags !== undefined) data.tags = updateData.tags;

    // Keep status as pending on edit
    data.status = 'pending';

    const article = await prisma.blogArticle.update({
      where: { id },
      data,
    });

    await revalidateArticle({
      articleId: article.id,
      slug: article.slug,
      categoryId: article.categoryId,
      authorProfileIds: [profile.id],
    });

    return {
      success: true,
      data: { articleId: article.id },
    };
  } catch (error) {
    console.error('Error updating article:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Αποτυχία ενημέρωσης άρθρου',
    };
  }
}

/**
 * Delete own article (only if draft or pending)
 */
export async function deleteMyArticle(
  id: string,
): Promise<ActionResult<void>> {
  try {
    const session = await requireAuth();
    const userId = session.user.id;

    const profile = await prisma.profile.findUnique({
      where: { uid: userId },
      select: { id: true },
    });

    if (!profile) {
      return { success: false, error: 'Δεν βρέθηκε προφίλ' };
    }

    // Verify ownership
    const authorLink = await prisma.blogArticleAuthor.findFirst({
      where: { articleId: id, profileId: profile.id },
    });

    if (!authorLink) {
      return { success: false, error: 'Δεν έχετε δικαίωμα διαγραφής αυτού του άρθρου' };
    }

    // Verify article is not published
    const existing = await prisma.blogArticle.findUnique({
      where: { id },
      select: { status: true, slug: true, categoryId: true },
    });

    if (!existing) {
      return { success: false, error: 'Το άρθρο δεν βρέθηκε' };
    }

    if (existing.status === 'published') {
      return { success: false, error: 'Δεν μπορείτε να διαγράψετε δημοσιευμένο άρθρο' };
    }

    await prisma.blogArticle.delete({ where: { id } });

    await revalidateArticle({
      articleId: id,
      slug: existing.slug,
      categoryId: existing.categoryId,
      authorProfileIds: [profile.id],
    });

    return { success: true };
  } catch (error) {
    console.error('Error deleting article:', error);
    return { success: false, error: 'Αποτυχία διαγραφής άρθρου' };
  }
}
