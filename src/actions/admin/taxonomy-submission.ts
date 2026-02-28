'use server';

import { prisma } from '@/lib/prisma/client';
import { revalidatePath } from 'next/cache';
import { getAdminSessionWithPermission } from './helpers';
import { ADMIN_RESOURCES } from '@/lib/auth/roles';
import { getTaxonomyData } from './taxonomy-helpers';
import { generateUniqueSlug } from '@/lib/utils/text/slug';
import { createSubmissionId } from '@/lib/utils/taxonomy-submission';
import { findProById, injectTaxonomyItem } from '@/lib/taxonomies';
import {
  adminListTaxonomySubmissionsSchema,
  type AdminListTaxonomySubmissionsInput,
} from '@/lib/validations/admin';
import type { DatasetItem } from '@/lib/types/datasets';
import type { TaxonomyType } from '@/lib/types/taxonomy-operations';
import { isSuccess } from '@/lib/types/server-actions';

// ============================================================================
// LIST & STATS
// ============================================================================

export async function listTaxonomySubmissions(
  params: Partial<AdminListTaxonomySubmissionsInput> = {},
) {
  try {
    await getAdminSessionWithPermission(ADMIN_RESOURCES.TAXONOMIES, 'view');

    const validatedParams = adminListTaxonomySubmissionsSchema.parse(params);

    const {
      searchQuery,
      status,
      type,
      limit,
      offset,
      sortBy,
      sortDirection,
    } = validatedParams;

    // Build where clause
    const where: any = {};

    if (searchQuery) {
      where.label = { contains: searchQuery, mode: 'insensitive' };
    }

    if (status && status !== 'all') {
      where.status = status;
    }

    if (type && type !== 'all') {
      where.type = type;
    }

    const [items, total] = await Promise.all([
      prisma.taxonomySubmission.findMany({
        where,
        orderBy: {
          [sortBy]: sortDirection,
        },
        take: limit,
        skip: offset,
      }),
      prisma.taxonomySubmission.count({ where }),
    ]);

    // Fetch submitter profiles
    const userIds = [...new Set(items.map((i) => i.submittedBy))];
    const profiles = await prisma.profile.findMany({
      where: { uid: { in: userIds } },
      select: { id: true, uid: true, displayName: true, image: true },
    });
    const profileMap = new Map(profiles.map((p) => [p.uid, p]));

    return {
      success: true,
      data: {
        items: items.map((i) => {
          const profile = profileMap.get(i.submittedBy);
          return {
            ...i,
            categoryLabel: i.category
              ? (findProById(i.category)?.label ?? i.category)
              : null,
            submitterProfile: profile
              ? {
                  id: profile.id,
                  displayName: profile.displayName,
                  image: profile.image,
                }
              : null,
          };
        }),
        total,
        limit,
        offset,
      },
    };
  } catch (error) {
    console.error('Error listing taxonomy submissions:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to list taxonomy submissions',
    };
  }
}

export async function getTaxonomySubmissionStats() {
  try {
    await getAdminSessionWithPermission(ADMIN_RESOURCES.TAXONOMIES, 'view');

    const [total, pending, approved, rejected] = await Promise.all([
      prisma.taxonomySubmission.count(),
      prisma.taxonomySubmission.count({ where: { status: 'pending' } }),
      prisma.taxonomySubmission.count({ where: { status: 'approved' } }),
      prisma.taxonomySubmission.count({ where: { status: 'rejected' } }),
    ]);

    return {
      success: true,
      data: {
        total,
        pending,
        approved,
        rejected,
      },
    };
  } catch (error) {
    console.error('Error fetching taxonomy submission stats:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to fetch taxonomy submission stats',
    };
  }
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Collect all existing IDs from a flat taxonomy array
 */
function collectAllIds(items: DatasetItem[]): Set<string> {
  const ids = new Set<string>();
  for (const item of items) {
    ids.add(item.id);
    if (item.children) {
      for (const child of item.children) {
        ids.add(child.id);
      }
    }
  }
  return ids;
}

/**
 * Generate unique numeric ID (next after max existing)
 */
function generateUniqueNumericId(existingIds: Set<string>): string {
  let maxId = 0;
  for (const id of existingIds) {
    const numId = parseInt(id, 10);
    if (!isNaN(numId) && numId > maxId) {
      maxId = numId;
    }
  }
  return String(maxId + 1);
}

/**
 * Replace a submission ID with a real ID in all Profile.skills[] or Service.tags[]
 */
async function replaceSubmissionIdInRecords(
  submissionId: string,
  realId: string,
  type: 'skill' | 'tag',
): Promise<void> {
  const prefixedId = createSubmissionId(submissionId);

  if (type === 'skill') {
    await prisma.$executeRaw`
      UPDATE "profiles"
      SET "skills" = array_replace("skills", ${prefixedId}, ${realId})
      WHERE ${prefixedId} = ANY("skills")
    `;
  } else {
    await prisma.$executeRaw`
      UPDATE "services"
      SET "tags" = array_replace("tags", ${prefixedId}, ${realId})
      WHERE ${prefixedId} = ANY("tags")
    `;
  }
}

/**
 * Remove a submission ID from all Profile.skills[] or Service.tags[]
 */
async function removeSubmissionIdFromRecords(
  submissionId: string,
  type: 'skill' | 'tag',
): Promise<void> {
  const prefixedId = createSubmissionId(submissionId);

  if (type === 'skill') {
    await prisma.$executeRaw`
      UPDATE "profiles"
      SET "skills" = array_remove("skills", ${prefixedId})
      WHERE ${prefixedId} = ANY("skills")
    `;
  } else {
    await prisma.$executeRaw`
      UPDATE "services"
      SET "tags" = array_remove("tags", ${prefixedId})
      WHERE ${prefixedId} = ANY("tags")
    `;
  }
}

// ============================================================================
// APPROVE
// ============================================================================

interface ApproveTaxonomyResult {
  success: boolean;
  error?: string;
  assignedId?: string;
  draft?: {
    taxonomyType: TaxonomyType;
    item: DatasetItem;
  };
}

export async function approveTaxonomySubmission(
  id: string,
): Promise<ApproveTaxonomyResult> {
  try {
    const session = await getAdminSessionWithPermission(
      ADMIN_RESOURCES.TAXONOMIES,
      'edit',
    );

    const record = await prisma.taxonomySubmission.findUnique({ where: { id } });
    if (!record) {
      return { success: false, error: 'Record not found' };
    }
    if (record.status !== 'pending') {
      return { success: false, error: 'Record is not pending' };
    }

    // Determine taxonomy type
    const taxonomyType: TaxonomyType =
      record.type === 'skill' ? 'skills' : 'tags';

    // Read current dataset from Git to generate unique ID/slug
    const dataResult = await getTaxonomyData(taxonomyType);
    if (!isSuccess(dataResult)) {
      return {
        success: false,
        error: 'Failed to read taxonomy data',
      };
    }

    const currentItems = dataResult.data;
    const existingIds = collectAllIds(currentItems);

    // Generate real numeric ID and slug
    const newId = generateUniqueNumericId(existingIds);
    const slug = generateUniqueSlug(
      record.label
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, ''),
      currentItems,
    );

    // Create new dataset item
    const newItem: DatasetItem = {
      id: newId,
      label: record.label,
      slug,
    };

    // For skills, add category reference
    if (record.type === 'skill' && record.category) {
      newItem.category = record.category;
    }

    // Update DB record
    await prisma.taxonomySubmission.update({
      where: { id },
      data: {
        status: 'approved',
        assignedId: newId,
        reviewedBy: session.user.id,
        reviewedAt: new Date(),
      },
    });

    // Replace submission ID with real ID in all profiles/services
    await replaceSubmissionIdInRecords(id, newId, record.type as 'skill' | 'tag');

    // Inject into runtime taxonomy cache so the item is immediately available
    // without requiring a rebuild of maps.generated.json
    injectTaxonomyItem(taxonomyType, newItem);

    revalidatePath('/admin/taxonomies');
    revalidatePath('/dashboard');

    // Return draft data so the client can save it to localStorage
    // Admin then publishes from /admin/git like any other taxonomy change
    return {
      success: true,
      assignedId: newId,
      draft: { taxonomyType, item: newItem },
    };
  } catch (error) {
    console.error('Error approving taxonomy submission:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to approve taxonomy submission',
    };
  }
}

// ============================================================================
// REJECT
// ============================================================================

export async function rejectTaxonomySubmission(
  id: string,
  reason?: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getAdminSessionWithPermission(
      ADMIN_RESOURCES.TAXONOMIES,
      'edit',
    );

    const record = await prisma.taxonomySubmission.findUnique({ where: { id } });
    if (!record) {
      return { success: false, error: 'Record not found' };
    }
    if (record.status !== 'pending') {
      return { success: false, error: 'Record is not pending' };
    }

    // Update DB record
    await prisma.taxonomySubmission.update({
      where: { id },
      data: {
        status: 'rejected',
        rejectReason: reason || null,
        reviewedBy: session.user.id,
        reviewedAt: new Date(),
      },
    });

    // Remove submission ID from all profiles/services
    await removeSubmissionIdFromRecords(id, record.type as 'skill' | 'tag');

    revalidatePath('/admin/taxonomies');
    revalidatePath('/dashboard');

    return { success: true };
  } catch (error) {
    console.error('Error rejecting taxonomy submission:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to reject taxonomy submission',
    };
  }
}

// ============================================================================
// BULK OPERATIONS
// ============================================================================

export async function bulkApproveTaxonomySubmissions(
  ids: string[],
): Promise<{ success: boolean; error?: string; approved: number }> {
  let approved = 0;
  for (const id of ids) {
    const result = await approveTaxonomySubmission(id);
    if (result.success) approved++;
  }
  return {
    success: approved > 0,
    approved,
    error:
      approved === ids.length
        ? undefined
        : `Approved ${approved} of ${ids.length} items`,
  };
}

export async function bulkRejectTaxonomySubmissions(
  ids: string[],
  reason?: string,
): Promise<{ success: boolean; error?: string; rejected: number }> {
  let rejected = 0;
  for (const id of ids) {
    const result = await rejectTaxonomySubmission(id, reason);
    if (result.success) rejected++;
  }
  return {
    success: rejected > 0,
    rejected,
    error:
      rejected === ids.length
        ? undefined
        : `Rejected ${rejected} of ${ids.length} items`,
  };
}
