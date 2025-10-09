'use server';

import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma/client';
import {
  adminListVerificationsSchema,
  adminUpdateVerificationStatusSchema,
  adminDeleteVerificationSchema,
  type AdminListVerificationsInput,
  type AdminUpdateVerificationStatusInput,
  type AdminDeleteVerificationInput,
} from '@/lib/validations/admin';

// Helper function to get authenticated admin session
async function getAdminSession() {
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });

  if (!session?.user) {
    redirect('/login');
  }

  const isAdmin = session.user.role === 'admin';

  if (!isAdmin) {
    throw new Error('Unauthorized: Admin role required');
  }

  return session;
}

/**
 * List verifications with filters and pagination
 */
export async function listVerifications(
  params: Partial<AdminListVerificationsInput> = {},
) {
  try {
    await getAdminSession();

    const validatedParams = adminListVerificationsSchema.parse(params);

    const {
      searchQuery,
      status,
      limit,
      offset,
      sortBy,
      sortDirection,
    } = validatedParams;

    // Build where clause
    const where: any = {};

    // Search filter (AFM or business name)
    if (searchQuery) {
      where.OR = [
        { afm: { contains: searchQuery, mode: 'insensitive' } },
        { name: { contains: searchQuery, mode: 'insensitive' } },
      ];
    }

    // Status filter
    if (status && status !== 'all') {
      where.status = status;
    }

    // Execute query
    const [verifications, total] = await Promise.all([
      prisma.profileVerification.findMany({
        where,
        include: {
          profile: {
            select: {
              id: true,
              displayName: true,
              image: true,
              type: true,
              user: {
                select: {
                  id: true,
                  email: true,
                },
              },
            },
          },
        },
        orderBy: {
          [sortBy]: sortDirection,
        },
        take: limit,
        skip: offset,
      }),
      prisma.profileVerification.count({ where }),
    ]);

    return {
      success: true,
      data: {
        verifications,
        total,
        limit,
        offset,
      },
    };
  } catch (error) {
    console.error('Error listing verifications:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to list verifications',
    };
  }
}

/**
 * Get single verification with full details
 */
export async function getVerification(verificationId: string) {
  try {
    await getAdminSession();

    const verification = await prisma.profileVerification.findUnique({
      where: { id: verificationId },
      include: {
        profile: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
                role: true,
              },
            },
          },
        },
      },
    });

    if (!verification) {
      return {
        success: false,
        error: 'Verification not found',
      };
    }

    return {
      success: true,
      data: verification,
    };
  } catch (error) {
    console.error('Error fetching verification:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to fetch verification',
    };
  }
}

/**
 * Update verification status (Approve or Reject)
 */
export async function updateVerificationStatus(
  params: AdminUpdateVerificationStatusInput,
) {
  try {
    await getAdminSession();

    const validatedParams =
      adminUpdateVerificationStatusSchema.parse(params);

    const { verificationId, status, notes } = validatedParams;

    // Update verification status
    const verification = await prisma.profileVerification.update({
      where: { id: verificationId },
      data: {
        status,
        updatedAt: new Date(),
      },
      include: {
        profile: {
          select: {
            id: true,
            displayName: true,
            verified: true,
          },
        },
      },
    });

    // Update profile's verified status based on verification status
    if (status === 'APPROVED') {
      await prisma.profile.update({
        where: { id: verification.pid },
        data: {
          verified: true,
        },
      });
    } else if (status === 'REJECTED' || status === 'PENDING') {
      // If rejected or pending, ensure profile is not verified
      await prisma.profile.update({
        where: { id: verification.pid },
        data: {
          verified: false,
        },
      });
    }

    // TODO: Create audit log entry if you have an audit log system
    // TODO: Send email notification to user about verification status

    return {
      success: true,
      data: verification,
    };
  } catch (error) {
    console.error('Error updating verification status:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to update verification status',
    };
  }
}

/**
 * Delete verification
 */
export async function deleteVerification(
  params: AdminDeleteVerificationInput,
) {
  try {
    await getAdminSession();

    const validatedParams = adminDeleteVerificationSchema.parse(params);
    const { verificationId } = validatedParams;

    // Check if verification exists
    const verification = await prisma.profileVerification.findUnique({
      where: { id: verificationId },
      select: { pid: true },
    });

    if (!verification) {
      return {
        success: false,
        error: 'Verification not found',
      };
    }

    // Delete the verification
    await prisma.profileVerification.delete({
      where: { id: verificationId },
    });

    // Also unverify the profile
    await prisma.profile.update({
      where: { id: verification.pid },
      data: {
        verified: false,
      },
    });

    return {
      success: true,
      data: { id: verificationId },
    };
  } catch (error) {
    console.error('Error deleting verification:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to delete verification',
    };
  }
}

/**
 * Get verification statistics
 */
export async function getVerificationStats() {
  try {
    await getAdminSession();

    const [total, pending, approved, rejected] = await Promise.all([
      prisma.profileVerification.count(),
      prisma.profileVerification.count({ where: { status: 'PENDING' } }),
      prisma.profileVerification.count({ where: { status: 'APPROVED' } }),
      prisma.profileVerification.count({ where: { status: 'REJECTED' } }),
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
    console.error('Error fetching verification stats:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to fetch verification stats',
    };
  }
}

/**
 * Update verification status - FormData version for useActionState
 */
export async function updateVerificationStatusAction(
  prevState: { success: boolean; error?: string } | null,
  formData: FormData,
): Promise<{ success: boolean; error?: string }> {
  try {
    const verificationId = formData.get('verificationId');
    const status = formData.get('status');
    const notes = formData.get('notes');

    if (!verificationId || !status) {
      return {
        success: false,
        error: 'Verification ID and status are required',
      };
    }

    // Parse and validate
    const rawData = {
      verificationId: verificationId as string,
      status: status as string,
      notes: notes ? (notes as string) : undefined,
    };

    const validationResult =
      adminUpdateVerificationStatusSchema.safeParse(rawData);

    if (!validationResult.success) {
      return {
        success: false,
        error:
          'Validation failed: ' +
          validationResult.error.issues.map((e) => e.message).join(', '),
      };
    }

    const result = await updateVerificationStatus(validationResult.data);
    return result;
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to update verification status',
    };
  }
}
