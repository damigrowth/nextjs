'use server';

import { prisma } from '@/lib/prisma/client';
import { ActionResult } from '@/lib/types/api';
import { requireAuth, hasAnyRole } from '@/actions/auth/server';
import {
  submitTaxonomySubmissionSchema,
  type SubmitTaxonomySubmissionInput,
} from '@/lib/validations/taxonomy-submission';
import { createSubmissionId } from '@/lib/utils/taxonomy-submission';
import { getSkillsByCategory } from '@/lib/taxonomies';
import { getTags } from '@/lib/taxonomies';
import { normalizeTerm } from '@/lib/utils/text/normalize';

/**
 * Submit a new taxonomy item (skill or tag) for admin approval.
 *
 * - Auth check: must be logged-in pro user
 * - Duplicate detection against existing dataset + existing submission records
 * - Rate limit: max 5 submissions per user per 24h
 */
export async function submitTaxonomySubmission(
  input: SubmitTaxonomySubmissionInput,
): Promise<ActionResult<{ pendingId: string }>> {
  try {
    // 1. Auth check
    const session = await requireAuth();
    const userId = session.user.id;

    const roleCheck = await hasAnyRole(['freelancer', 'company']);
    if (!roleCheck.success || !roleCheck.data) {
      return { success: false, message: 'Δεν έχετε δικαίωμα υποβολής' };
    }

    // 2. Validate input
    const parsed = submitTaxonomySubmissionSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        message: parsed.error.issues[0]?.message || 'Μη έγκυρα δεδομένα',
      };
    }

    const { label, type, category } = parsed.data;
    const normalizedLabel = normalizeTerm(label);

    // 3. Rate limit: max 5 submissions per user per 24h
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentCount = await prisma.taxonomySubmission.count({
      where: {
        submittedBy: userId,
        createdAt: { gte: oneDayAgo },
      },
    });

    if (recentCount >= 5) {
      return {
        success: false,
        message: 'Έχετε φτάσει το μέγιστο όριο υποβολών (5) για σήμερα',
      };
    }

    // 4. Duplicate detection — check existing dataset
    if (type === 'skill' && category) {
      const existingSkills = getSkillsByCategory(category);
      const duplicate = existingSkills.find(
        (s) => s.label && normalizeTerm(s.label) === normalizedLabel,
      );
      if (duplicate) {
        return {
          success: false,
          message: `Η δεξιότητα "${label}" υπάρχει ήδη`,
        };
      }
    } else if (type === 'tag') {
      const existingTags = getTags();
      const duplicate = existingTags.find(
        (t) => t.label && normalizeTerm(t.label) === normalizedLabel,
      );
      if (duplicate) {
        return {
          success: false,
          message: `Το tag "${label}" υπάρχει ήδη`,
        };
      }
    }

    // 5. Duplicate detection — check existing submission records
    const existingSubmission = await prisma.taxonomySubmission.findFirst({
      where: {
        type,
        status: 'pending',
        label: { equals: label, mode: 'insensitive' },
      },
    });

    if (existingSubmission) {
      return {
        success: false,
        message: `Η υποβολή "${label}" εκκρεμεί ήδη για έγκριση`,
      };
    }

    // 6. Create record
    const record = await prisma.taxonomySubmission.create({
      data: {
        label,
        type,
        category: type === 'skill' ? category : undefined,
        submittedBy: userId,
      },
    });

    return {
      success: true,
      data: { pendingId: createSubmissionId(record.id) },
    };
  } catch (error) {
    console.error('submitTaxonomySubmission error:', error);
    return { success: false, message: 'Σφάλμα κατά την υποβολή' };
  }
}

/**
 * Get all taxonomy submissions by the current user (for form display).
 * Returns items with status 'pending' so they can be shown with orange styling.
 */
export async function getUserTaxonomySubmissions(
  type: 'skill' | 'tag',
): Promise<
  ActionResult<
    Array<{ pendingId: string; label: string; category?: string | null }>
  >
> {
  try {
    const session = await requireAuth();
    const userId = session.user.id;

    const records = await prisma.taxonomySubmission.findMany({
      where: {
        submittedBy: userId,
        type,
        status: 'pending',
      },
      select: {
        id: true,
        label: true,
        category: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      success: true,
      data: records.map((r) => ({
        pendingId: createSubmissionId(r.id),
        label: r.label,
        category: r.category,
      })),
    };
  } catch (error) {
    console.error('getUserTaxonomySubmissions error:', error);
    return { success: false, message: 'Σφάλμα κατά την ανάκτηση' };
  }
}
