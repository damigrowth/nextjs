'use server';

import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { processImageForDatabase } from '@/lib/utils/cloudinary';
import { normalizeTerm } from '@/lib/utils/text/normalize';
import { UserRole, UserType, JourneyStep } from '@prisma/client';
// legacy exports
// import {
//   listUsersSchema,
//   createAdminUserSchema,
//   setRoleSchema,
//   banUserSchema,
//   unbanUserSchema,
//   removeUserSchema,
//   impersonateUserSchema,

//   updateAdminUserSchema,
//   setUserPasswordSchema,
// } from '@/lib/validations';

// Import admin-specific schemas
import {
  adminListUsersSchema,
  adminCreateUserSchema,
  adminUpdateUserSchema,
  adminSetRoleSchema,
  adminBanUserSchema,
  adminUnbanUserSchema,
  adminRemoveUserSchema,
  adminImpersonateUserSchema,
  adminSetPasswordSchema,
  revokeSessionSchema,
  revokeUserSessionsSchema,
  updateUserBasicInfoSchema,
  updateUserStatusSchema,
} from '@/lib/validations/admin';

// Import types from centralized validation schemas
import type { CreateUserInput, UpdateUserInput } from '@/lib/validations';
import type { ActionResult } from '@/lib/types/api';
import { getAdminSession, getAdminSessionWithPermission } from './helpers';
import { ADMIN_RESOURCES, canAssignRole } from '@/lib/auth/roles';

// Admin Actions using correct Better Auth API methods
export async function getUser(userId: string) {
  try {
    await getAdminSessionWithPermission(ADMIN_RESOURCES.USERS, 'view');

    const { prisma } = await import('@/lib/prisma/client');

    // Fetch user with related data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: {
          include: {
            _count: {
              select: {
                services: true,
                reviews: true,
              },
            },
          },
        },
        accounts: true,
        sessions: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!user) {
      return {
        success: false,
        error: 'User not found',
      };
    }

    return {
      success: true,
      data: user,
    };
  } catch (error) {
    console.error('Error fetching user:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch user',
    };
  }
}

export async function listUsers(
  params: Partial<z.infer<typeof adminListUsersSchema>> & {
    type?: UserType | 'all';
    provider?: string;
    step?: JourneyStep | 'all';
    status?: string;
    role?: UserRole | 'all';
  } = {},
) {
  try {
    await getAdminSessionWithPermission(ADMIN_RESOURCES.USERS, 'view');

    const { prisma } = await import('@/lib/prisma/client');

    // Build where clause for filters
    const where: any = {};

    // Search filter
    if (params.searchValue) {
      const searchField = params.searchField || 'email';
      const searchOperator = params.searchOperator || 'contains';

      if (searchOperator === 'contains') {
        where[searchField] = {
          contains: params.searchValue,
          mode: 'insensitive',
        };
      } else if (searchOperator === 'starts_with') {
        where[searchField] = {
          startsWith: params.searchValue,
          mode: 'insensitive',
        };
      } else if (searchOperator === 'ends_with') {
        where[searchField] = {
          endsWith: params.searchValue,
          mode: 'insensitive',
        };
      }
    }

    // Type filter (simple/pro)
    if (params.type && params.type !== 'all') {
      where.type = params.type;
    }

    // Provider filter (email/google)
    if (params.provider && params.provider !== 'all') {
      where.provider = params.provider;
    }

    // Step filter (EMAIL_VERIFICATION/OAUTH_SETUP/ONBOARDING/DASHBOARD)
    if (params.step && params.step !== 'all') {
      where.step = params.step;
    }

    // Status filter (verified/unverified/banned/blocked)
    if (params.status && params.status !== 'all') {
      if (params.status === 'verified') {
        where.emailVerified = true;
      } else if (params.status === 'unverified') {
        where.emailVerified = false;
      } else if (params.status === 'banned') {
        where.banned = true;
      } else if (params.status === 'blocked') {
        where.blocked = true;
      }
    }

    // Role filter (user/freelancer/company/admin)
    if (params.role && params.role !== 'all') {
      where.role = params.role;
    }

    const limit = params.limit || 10;
    const offset = params.offset || 0;
    const sortBy = params.sortBy || 'createdAt';
    const sortDirection = params.sortDirection || 'desc';

    // Get total count
    const total = await prisma.user.count({ where });

    // Get users with pagination and sorting
    const users = await prisma.user.findMany({
      where,
      take: limit,
      skip: offset,
      orderBy: { [sortBy]: sortDirection },
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        displayUsername: true,
        displayName: true,
        firstName: true,
        lastName: true,
        image: true,
        emailVerified: true,
        confirmed: true,
        blocked: true,
        banned: true,
        banExpires: true,
        banReason: true,
        type: true,
        role: true,
        provider: true,
        step: true,
        createdAt: true,
        updatedAt: true,
        lastUnreadEmailSentAt: true,
        lastUsernameChangeAt: true,
      },
    });

    return {
      success: true,
      data: {
        users,
        total,
      },
    };
  } catch (error) {
    console.error('Error listing users:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to list users',
    };
  }
}

export async function createUser(data: z.infer<typeof adminCreateUserSchema>) {
  try {
    await getAdminSessionWithPermission(ADMIN_RESOURCES.USERS, 'view');

    const validatedData = adminCreateUserSchema.parse(data);

    // Your Better Auth configuration supports custom roles through additionalFields and database hooks
    // Pass the role directly - your database hook will handle it correctly
    const result = await auth.api.createUser({
      body: {
        email: validatedData.email,
        password: validatedData.password,
        name: validatedData.name,
        role: validatedData.role as any, // Your custom roles: 'user', 'freelancer', 'company', 'admin'
        displayName: validatedData.displayName,
        username: validatedData.username,
      } as any, // Type assertion for the entire body to allow custom fields
      headers: await headers(),
    });

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error('Error creating user:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create user',
    };
  }
}

export async function setUserRole(data: z.infer<typeof adminSetRoleSchema>) {
  try {
    const session = await getAdminSessionWithPermission(
      ADMIN_RESOURCES.USERS,
      'view',
    );

    const validatedData = adminSetRoleSchema.parse(data);

    // Check if current user has permission to assign this role
    if (!canAssignRole(session.user.role, validatedData.role)) {
      return {
        success: false,
        error: 'You do not have permission to assign this role',
      };
    }

    // Your Better Auth supports all your custom roles: 'user', 'freelancer', 'company', 'admin'
    const result = await auth.api.setRole({
      body: {
        userId: validatedData.userId,
        role: validatedData.role as any, // Type assertion for your custom roles
      },
      headers: await headers(),
    });

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error('Error setting user role:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to set user role',
    };
  }
}

export async function banUser(data: z.infer<typeof adminBanUserSchema>) {
  try {
    await getAdminSessionWithPermission(ADMIN_RESOURCES.USERS, 'view');

    const validatedData = adminBanUserSchema.parse(data);

    const result = await auth.api.banUser({
      body: validatedData,
      headers: await headers(),
    });

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error('Error banning user:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to ban user',
    };
  }
}

export async function unbanUser(data: z.infer<typeof adminUnbanUserSchema>) {
  try {
    await getAdminSessionWithPermission(ADMIN_RESOURCES.USERS, 'view');

    const validatedData = adminUnbanUserSchema.parse(data);

    const result = await auth.api.unbanUser({
      body: validatedData,
      headers: await headers(),
    });

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error('Error unbanning user:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to unban user',
    };
  }
}

export async function removeUser(data: z.infer<typeof adminRemoveUserSchema>) {
  try {
    await getAdminSessionWithPermission(ADMIN_RESOURCES.USERS, 'full');

    const validatedData = adminRemoveUserSchema.parse(data);

    const result = await auth.api.removeUser({
      body: validatedData,
      headers: await headers(),
    });

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error('Error removing user:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to remove user',
    };
  }
}

export async function impersonateUser(
  data: z.infer<typeof adminImpersonateUserSchema>,
) {
  try {
    await getAdminSessionWithPermission(ADMIN_RESOURCES.USERS, 'edit');

    const validatedData = adminImpersonateUserSchema.parse(data);

    const result = await auth.api.impersonateUser({
      body: validatedData,
      headers: await headers(),
    });

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error('Error impersonating user:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to impersonate user',
    };
  }
}

export async function stopImpersonating() {
  try {
    await getAdminSessionWithPermission(ADMIN_RESOURCES.USERS, 'edit');

    const result = await auth.api.stopImpersonating({
      headers: await headers(),
    });

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error('Error stopping impersonation:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to stop impersonation',
    };
  }
}

export async function listUserSessions(userId: string) {
  try {
    await getAdminSessionWithPermission(ADMIN_RESOURCES.USERS, 'edit');

    const result = await auth.api.listUserSessions({
      body: { userId },
      headers: await headers(),
    });

    // console.log('Better Auth listUserSessions result:', result);

    // Better Auth returns { sessions: [...] }
    const sessions = result?.sessions || [];

    return {
      success: true,
      data: sessions,
    };
  } catch (error) {
    console.error('Error listing user sessions:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to list user sessions',
    };
  }
}

export async function revokeUserSession(
  data: z.infer<typeof revokeSessionSchema>,
) {
  try {
    await getAdminSessionWithPermission(ADMIN_RESOURCES.USERS, 'view');

    const validatedData = revokeSessionSchema.parse(data);

    const result = await auth.api.revokeUserSession({
      body: validatedData,
      headers: await headers(),
    });

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error('Error revoking user session:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to revoke user session',
    };
  }
}

export async function revokeAllUserSessions(
  data: z.infer<typeof revokeUserSessionsSchema>,
) {
  try {
    await getAdminSessionWithPermission(ADMIN_RESOURCES.USERS, 'view');

    const validatedData = revokeUserSessionsSchema.parse(data);

    const result = await auth.api.revokeUserSessions({
      body: validatedData,
      headers: await headers(),
    });

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error('Error revoking all user sessions:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to revoke all user sessions',
    };
  }
}

export async function updateUser(data: z.infer<typeof adminUpdateUserSchema>) {
  try {
    await getAdminSessionWithPermission(ADMIN_RESOURCES.USERS, 'view');

    const validatedData = adminUpdateUserSchema.parse(data);
    const { userId, ...updateFields } = validatedData;

    // Better Auth doesn't have a generic updateUser method for admin use
    // We need to use specific API methods for each field type
    const results = [];
    let hasUpdates = false;

    // Handle role update if provided
    if (updateFields.role) {
      const roleResult = await auth.api.setRole({
        body: {
          userId,
          role: updateFields.role as any, // Type assertion for custom roles
        },
        headers: await headers(),
      });
      results.push({ field: 'role', result: roleResult });
      hasUpdates = true;
    }

    // For other fields like name, email, confirmed, blocked, step, emailVerified
    // Better Auth admin API might not have direct methods
    // Note: These fields would typically need direct database access or specific Better Auth methods

    if (!hasUpdates) {
      return {
        success: false,
        error:
          'No supported fields to update. Only role updates are currently supported via Better Auth API.',
      };
    }

    return {
      success: true,
      data: results,
      message: `Updated ${results.length} field(s) successfully`,
    };
  } catch (error) {
    console.error('Error updating user:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update user',
    };
  }
}

export async function setUserPassword(
  data: z.infer<typeof adminSetPasswordSchema>,
) {
  try {
    await getAdminSessionWithPermission(ADMIN_RESOURCES.USERS, 'edit');

    const validatedData = adminSetPasswordSchema.parse(data);

    const result = await auth.api.setUserPassword({
      body: validatedData,
      headers: await headers(),
    });

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error('Error setting user password:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to set user password',
    };
  }
}

// =============================================
// PRISMA-BASED USER UPDATE ACTIONS
// =============================================

/**
 * Update user basic information via Prisma
 * Fields: name, email, username, displayName
 */
export async function updateUserBasicInfo(data: {
  userId: string;
  name?: string;
  email?: string;
  username?: string;
  displayName?: string;
}) {
  try {
    await getAdminSessionWithPermission(ADMIN_RESOURCES.USERS, 'view');

    const { prisma } = await import('@/lib/prisma/client');

    // Check if username is being changed and if it's already taken
    if (data.username !== undefined) {
      const usernameCheck = await auth.api.isUsernameAvailable({
        body: { username: data.username },
      });

      // Allow if username is available OR if it's the same user keeping their username
      const currentUser = await prisma.user.findUnique({
        where: { id: data.userId },
        select: { username: true },
      });

      const isKeepingSameUsername = currentUser?.username === data.username;

      if (!usernameCheck?.available && !isKeepingSameUsername) {
        return {
          success: false,
          error:
            'Το συγκεκριμένο username χρησιμοποιείται ήδη. Επιλέξτε ένα διαφορετικό username.',
        };
      }
    }

    // Build update object with only provided fields
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.username !== undefined) updateData.username = data.username;
    if (data.displayName !== undefined)
      updateData.displayName = data.displayName;

    const user = await prisma.user.update({
      where: { id: data.userId },
      data: updateData,
    });

    return {
      success: true,
      data: user,
    };
  } catch (error) {
    console.error('Error updating user basic info:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to update user basic info',
    };
  }
}

/**
 * Update user status fields via Prisma
 * Fields: confirmed, blocked, emailVerified, step
 */
export async function updateUserStatus(data: {
  userId: string;
  confirmed?: boolean;
  blocked?: boolean;
  emailVerified?: boolean;
  step?: JourneyStep;
}) {
  try {
    await getAdminSessionWithPermission(ADMIN_RESOURCES.USERS, 'edit');

    const { prisma } = await import('@/lib/prisma/client');

    // Build update object with only provided fields
    const updateData: any = {};
    if (data.confirmed !== undefined) updateData.confirmed = data.confirmed;
    if (data.blocked !== undefined) updateData.blocked = data.blocked;
    if (data.emailVerified !== undefined)
      updateData.emailVerified = data.emailVerified;
    if (data.step !== undefined) updateData.step = data.step;

    const user = await prisma.user.update({
      where: { id: data.userId },
      data: updateData,
    });

    return {
      success: true,
      data: user,
    };
  } catch (error) {
    console.error('Error updating user status:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to update user status',
    };
  }
}

/**
 * Update user ban status with reason and expiry via Prisma
 * This complements Better Auth's banUser API
 */
export async function updateUserBanStatus(data: {
  userId: string;
  banned: boolean;
  banReason?: string | null;
  banExpires?: Date | null;
}) {
  try {
    await getAdminSessionWithPermission(ADMIN_RESOURCES.USERS, 'edit');

    const { prisma } = await import('@/lib/prisma/client');

    const user = await prisma.user.update({
      where: { id: data.userId },
      data: {
        banned: data.banned,
        banReason: data.banReason,
        banExpires: data.banExpires,
      },
    });

    return {
      success: true,
      data: user,
    };
  } catch (error) {
    console.error('Error updating user ban status:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to update user ban status',
    };
  }
}

/**
 * Update user image via Prisma
 */
export async function updateUserImage(data: {
  userId: string;
  image: string | null;
}) {
  try {
    await getAdminSessionWithPermission(ADMIN_RESOURCES.USERS, 'edit');

    const { prisma } = await import('@/lib/prisma/client');

    const user = await prisma.user.update({
      where: { id: data.userId },
      data: { image: data.image },
    });

    return {
      success: true,
      data: user,
    };
  } catch (error) {
    console.error('Error updating user image:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to update user image',
    };
  }
}

/**
 * Block/unblock user via Prisma
 */
export async function toggleUserBlock(data: {
  userId: string;
  blocked: boolean;
}) {
  try {
    await getAdminSessionWithPermission(ADMIN_RESOURCES.USERS, 'view');

    const { prisma } = await import('@/lib/prisma/client');

    const user = await prisma.user.update({
      where: { id: data.userId },
      data: { blocked: data.blocked },
    });

    return {
      success: true,
      data: user,
      message: data.blocked
        ? 'User blocked successfully'
        : 'User unblocked successfully',
    };
  } catch (error) {
    console.error('Error toggling user block status:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to toggle user block status',
    };
  }
}

/**
 * Confirm/unconfirm user via Prisma
 */
export async function toggleUserConfirmation(data: {
  userId: string;
  confirmed: boolean;
}) {
  try {
    await getAdminSessionWithPermission(ADMIN_RESOURCES.USERS, 'view');

    const { prisma } = await import('@/lib/prisma/client');

    const user = await prisma.user.update({
      where: { id: data.userId },
      data: { confirmed: data.confirmed },
    });

    return {
      success: true,
      data: user,
      message: data.confirmed
        ? 'User confirmed successfully'
        : 'User unconfirmed successfully',
    };
  } catch (error) {
    console.error('Error toggling user confirmation:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to toggle user confirmation',
    };
  }
}

/**
 * Update user journey step via Prisma
 */
export async function updateUserJourneyStep(data: {
  userId: string;
  step: JourneyStep;
}) {
  try {
    await getAdminSessionWithPermission(ADMIN_RESOURCES.USERS, 'edit');

    const { prisma } = await import('@/lib/prisma/client');

    const user = await prisma.user.update({
      where: { id: data.userId },
      data: { step: data.step },
    });

    return {
      success: true,
      data: user,
      message: `User step updated to ${data.step}`,
    };
  } catch (error) {
    console.error('Error updating user journey step:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to update user journey step',
    };
  }
}

/**
 * Get user statistics for admin dashboard
 */
export async function getUserStats() {
  try {
    await getAdminSessionWithPermission(ADMIN_RESOURCES.USERS, 'view');

    const { prisma } = await import('@/lib/prisma/client');

    // Get counts in parallel
    const [
      total,
      activeUsers,
      bannedUsers,
      blockedUsers,
      unverifiedUsers,
      // Step counts
      emailVerificationStep,
      oauthSetupStep,
      onboardingStep,
      dashboardStep,
      // Provider counts
      emailProvider,
      googleProvider,
      // Type counts
      simpleUsers,
      proUsers,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: {
          banned: false,
          blocked: false,
          emailVerified: true,
          confirmed: true,
        },
      }),
      prisma.user.count({
        where: { banned: true },
      }),
      prisma.user.count({
        where: { blocked: true },
      }),
      prisma.user.count({
        where: {
          emailVerified: false,
        },
      }),
      // Step counts
      prisma.user.count({
        where: { step: 'EMAIL_VERIFICATION' },
      }),
      prisma.user.count({
        where: { step: 'OAUTH_SETUP' },
      }),
      prisma.user.count({
        where: { step: 'ONBOARDING' },
      }),
      prisma.user.count({
        where: { step: 'DASHBOARD' },
      }),
      // Provider counts
      prisma.user.count({
        where: { provider: 'email' },
      }),
      prisma.user.count({
        where: { provider: 'google' },
      }),
      // Type counts
      prisma.user.count({
        where: { type: 'user' },
      }),
      prisma.user.count({
        where: { type: 'pro' },
      }),
    ]);

    return {
      success: true,
      data: {
        total,
        active: activeUsers,
        banned: bannedUsers,
        blocked: blockedUsers,
        unverified: unverifiedUsers,
        byStep: {
          EMAIL_VERIFICATION: emailVerificationStep,
          OAUTH_SETUP: oauthSetupStep,
          ONBOARDING: onboardingStep,
          DASHBOARD: dashboardStep,
        },
        byProvider: {
          email: emailProvider,
          google: googleProvider,
        },
        byType: {
          simple: simpleUsers,
          pro: proUsers,
        },
      },
    };
  } catch (error) {
    console.error('Error getting user stats:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to get user stats',
    };
  }
}

// =============================================
// FORMDATA WRAPPER ACTIONS FOR USEACTIONSTATE
// =============================================

/**
 * Update user basic info - FormData version for useActionState
 */
export async function updateUserBasicInfoAction(
  prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  try {
    // Parse FormData including userId
    const rawData = {
      userId: formData.get('userId') as string,
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      username: formData.get('username') as string,
      displayName: formData.get('displayName') as string,
    };

    // Validate complete data with userId
    const validationResult = updateUserBasicInfoSchema.safeParse(rawData);

    if (!validationResult.success) {
      console.error(
        'User basic info validation errors:',
        validationResult.error,
      );
      return {
        success: false,
        error:
          'Validation failed: ' +
          validationResult.error.issues.map((e) => e.message).join(', '),
      };
    }

    const result = await updateUserBasicInfo(validationResult.data);

    return result;
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to update user basic info',
    };
  }
}

/**
 * Update user status - FormData version for useActionState
 */
export async function updateUserStatusAction(
  prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  try {
    // Parse FormData including userId
    const rawData = {
      userId: formData.get('userId') as string,
      role: formData.get('role') as UserRole,
      type: formData.get('type') as UserType,
      step: formData.get('step') as JourneyStep,
      emailVerified: formData.get('emailVerified') === 'true',
      confirmed: formData.get('confirmed') === 'true',
      blocked: formData.get('blocked') === 'true',
    };

    // Validate complete data with userId
    const validationResult = updateUserStatusSchema.safeParse(rawData);

    if (!validationResult.success) {
      console.error('User status validation errors:', validationResult.error);
      return {
        success: false,
        error:
          'Validation failed: ' +
          validationResult.error.issues.map((e) => e.message).join(', '),
      };
    }

    const { userId, role, ...statusData } = validationResult.data;

    // Handle role separately if provided (Better Auth API requirement)
    if (role) {
      const roleResult = await setUserRole({
        userId,
        role: role as any,
      });

      if (!roleResult.success) {
        return roleResult;
      }
    }

    // Update other status fields (excluding role which was handled above)
    const result = await updateUserStatus({
      userId,
      ...statusData,
    });

    return result;
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to update user status',
    };
  }
}

/**
 * Update user ban status - FormData version for useActionState
 */
export async function updateUserBanAction(
  prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const userId = formData.get('userId');

    if (!userId) {
      return {
        success: false,
        error: 'User ID is required',
      };
    }

    // Parse FormData
    const banned = formData.get('banned') === 'true';
    const rawData: any = {
      banReason: formData.get('banReason') as string,
    };

    // Validate ban reason
    if (banned && !rawData.banReason) {
      return {
        success: false,
        error: 'Ban reason is required when banning a user',
      };
    }

    // Calculate ban expiry
    let banExpires: Date | null = null;
    const isPermanent = formData.get('isPermanent') === 'true';
    const banDuration = formData.get('banDuration');

    if (banned && !isPermanent && banDuration) {
      banExpires = new Date(
        Date.now() + Number(banDuration) * 24 * 60 * 60 * 1000,
      );
    }

    const result = await updateUserBanStatus({
      userId: userId as string,
      banned,
      banReason: rawData.banReason || null,
      banExpires,
    });

    return result;
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to update user ban status',
    };
  }
}

/**
 * Update user image - FormData version for useActionState
 */
export async function updateUserImageAction(
  prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const userId = formData.get('userId');

    if (!userId) {
      return {
        success: false,
        error: 'User ID is required',
      };
    }

    const image = formData.get('image') as string | null;

    const result = await updateUserImage({
      userId: userId as string,
      image,
    });

    return result;
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to update user image',
    };
  }
}

/**
 * Update user account (display name and image) - Admin version for useActionState
 */
export async function updateAccountAdmin(prevState: any, formData: FormData) {
  try {
    // Verify admin authentication
    await getAdminSessionWithPermission(ADMIN_RESOURCES.USERS, 'view');

    // Parse FormData
    const userId = formData.get('userId')?.toString();
    const displayName = formData.get('displayName')?.toString();
    const imageStr = formData.get('image')?.toString();

    if (!userId) {
      return {
        success: false,
        message: 'User ID is required',
      };
    }

    // Parse image if provided and extract URL string
    let processedImage: string | null | undefined = undefined;
    if (imageStr) {
      try {
        const imageData = JSON.parse(imageStr);
        processedImage = processImageForDatabase(imageData);
      } catch (e) {
        return {
          success: false,
          message: 'Invalid image data',
        };
      }
    }

    // Validate with schema
    const validationResult = z
      .object({
        userId: z.string().min(1),
        displayName: z.string().min(1).max(100).optional(),
        image: z.string().nullable().optional(),
      })
      .safeParse({
        userId,
        displayName,
        image: processedImage,
      });

    if (!validationResult.success) {
      return {
        success: false,
        message: validationResult.error.issues[0].message,
      };
    }

    // Update user via Better Auth admin API
    const { prisma } = await import('@/lib/prisma/client');
    const { revalidateTag, revalidatePath } = await import('next/cache');
    const { getProfileTags, CACHE_TAGS } = await import('@/lib/cache');

    // Check if user has a profile
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { profile: { select: { id: true } } },
    });

    // Update User table
    await prisma.user.update({
      where: { id: userId },
      data: {
        displayName: displayName || undefined,
        ...(processedImage !== undefined && { image: processedImage }),
      },
    });

    // Sync to Profile table if profile exists (displayName and image are duplicated fields)
    if (user?.profile) {
      await prisma.profile.update({
        where: { uid: userId },
        data: {
          displayName: displayName || undefined,
          displayNameNormalized: displayName
            ? normalizeTerm(displayName)
            : undefined,
          ...(processedImage !== undefined && { image: processedImage }),
          updatedAt: new Date(),
        },
      });

      // Revalidate profile caches
      const profile = await prisma.profile.findUnique({
        where: { uid: userId },
        select: { id: true, uid: true, username: true },
      });

      if (profile) {
        const profileTags = getProfileTags(profile);
        profileTags.forEach((tag) => revalidateTag(tag));
        revalidatePath(`/admin/profiles/${profile.id}`);
        if (profile.username) {
          revalidatePath(`/profile/${profile.username}`);
        }
      }
    }

    return {
      success: true,
      message: 'Ο λογαριασμός ενημερώθηκε επιτυχώς!',
    };
  } catch (error) {
    console.error('Admin account update error:', error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : 'Failed to update account',
    };
  }
}

// =============================================
// TEAM MANAGEMENT (ADMIN ROLE ASSIGNMENT)
// =============================================

/**
 * Team member interface for admin display
 */
export interface TeamMember {
  id: string;
  email: string;
  username: string | null;
  displayName: string | null;
  firstName: string | null;
  lastName: string | null;
  image: string | null;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
  emailVerified: boolean;
  confirmed: boolean;
  blocked: boolean;
}

/**
 * Get all team members (users with admin, support, or editor roles)
 *
 * Only admins can view team members
 */
export async function getTeamMembers(): Promise<ActionResult<TeamMember[]>> {
  try {
    // Require permission to view team
    await getAdminSessionWithPermission(ADMIN_RESOURCES.TEAM, 'view');

    const { ADMIN_ROLES } = await import('@/lib/auth/roles');
    const { prisma } = await import('@/lib/prisma/client');

    const teamMembers = await prisma.user.findMany({
      where: {
        role: {
          in: [ADMIN_ROLES.ADMIN, ADMIN_ROLES.SUPPORT, ADMIN_ROLES.EDITOR],
        },
      },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        firstName: true,
        lastName: true,
        image: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        emailVerified: true,
        confirmed: true,
        blocked: true,
      },
      orderBy: [
        { role: 'asc' }, // admin first, then support, then editor
        { createdAt: 'desc' }, // newest first within each role
      ],
    });

    return {
      success: true,
      data: teamMembers,
    };
  } catch (error) {
    console.error('Get team members error:', error);
    return {
      success: false,
      error: 'Failed to get team members',
    };
  }
}

/**
 * Assign an admin role to a user
 *
 * Only admins can assign roles
 *
 * @param userId - User ID to assign role to
 * @param role - Admin role to assign (admin, support, or editor)
 */
export async function assignAdminRole(
  userId: string,
  role: UserRole,
): Promise<ActionResult<void>> {
  try {
    // Require permission to assign roles
    const session = await getAdminSessionWithPermission(
      ADMIN_RESOURCES.TEAM,
      'edit',
    );

    const { revalidatePath } = await import('next/cache');
    const { USER_ROLES } = await import('@/lib/auth/roles');
    const { prisma } = await import('@/lib/prisma/client');

    // Validate role - accept all user roles
    if (!Object.values(USER_ROLES).includes(role as any)) {
      return {
        success: false,
        error:
          'Invalid role. Must be one of: user, freelancer, company, admin, support, or editor',
      };
    }

    // Check if current user has permission to assign this role
    if (!canAssignRole(session.user.role, role)) {
      return {
        success: false,
        error: 'You do not have permission to assign this role',
      };
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      return {
        success: false,
        error: 'User not found',
      };
    }

    // Prevent admin from removing their own admin role
    if (session.user.id === userId && role !== USER_ROLES.ADMIN) {
      return {
        success: false,
        error: 'You cannot remove your own admin role',
      };
    }

    // Update user role
    await prisma.user.update({
      where: { id: userId },
      data: {
        role,
        step: 'DASHBOARD', // Ensure admin users are marked as completed
      },
    });

    // Revalidate team page
    revalidatePath('/admin/team');

    return {
      success: true,
      data: undefined,
    };
  } catch (error) {
    console.error('Assign admin role error:', error);
    return {
      success: false,
      error: 'Failed to assign admin role',
    };
  }
}

/**
 * Remove admin role from a user (revert to their original role)
 *
 * Only admins can remove roles
 *
 * @param userId - User ID to remove admin role from
 */
export async function removeAdminRole(
  userId: string,
): Promise<ActionResult<void>> {
  try {
    // Require permission to remove roles
    const session = await getAdminSessionWithPermission(
      ADMIN_RESOURCES.TEAM,
      'edit',
    );

    const { revalidatePath } = await import('next/cache');
    const { prisma } = await import('@/lib/prisma/client');

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        type: true,
      },
    });

    if (!user) {
      return {
        success: false,
        error: 'User not found',
      };
    }

    // Prevent admin from removing their own admin role
    if (session.user.id === userId) {
      return {
        success: false,
        error: 'You cannot remove your own admin role',
      };
    }

    // Determine what role to revert to based on user type
    let newRole: UserRole = 'user';
    if (user.type === 'pro') {
      // For pro users, check if they have a profile to determine role
      const profile = await prisma.profile.findUnique({
        where: { uid: userId },
        select: { type: true },
      });

      if (profile?.type === 'company') {
        newRole = 'company';
      } else if (profile?.type === 'freelancer') {
        newRole = 'freelancer';
      }
    }

    // Update user role back to original role
    await prisma.user.update({
      where: { id: userId },
      data: {
        role: newRole,
      },
    });

    // Revalidate team page
    revalidatePath('/admin/team');

    return {
      success: true,
      data: undefined,
    };
  } catch (error) {
    console.error('Remove admin role error:', error);
    return {
      success: false,
      error: 'Failed to remove admin role',
    };
  }
}

/**
 * Search users by email or username for role assignment
 *
 * Only admins can search users for role assignment
 *
 * @param search - Search query (email or username)
 * @param limit - Maximum number of results (default: 10)
 */
export async function searchUsersForRoleAssignment(
  search: string,
  limit: number = 10,
): Promise<ActionResult<TeamMember[]>> {
  try {
    // Require permission to search users
    await getAdminSessionWithPermission(ADMIN_RESOURCES.TEAM, 'view');

    const { prisma } = await import('@/lib/prisma/client');

    if (!search || search.length < 2) {
      return {
        success: false,
        error: 'Search query must be at least 2 characters',
      };
    }

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { email: { contains: search, mode: 'insensitive' } },
          { username: { contains: search, mode: 'insensitive' } },
          { displayName: { contains: search, mode: 'insensitive' } },
        ],
        // Optionally exclude users who already have admin roles
        // Commented out to allow changing existing admin roles
        // role: {
        //   notIn: [ADMIN_ROLES.ADMIN, ADMIN_ROLES.SUPPORT, ADMIN_ROLES.EDITOR],
        // },
      },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        firstName: true,
        lastName: true,
        image: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        emailVerified: true,
        confirmed: true,
        blocked: true,
      },
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      success: true,
      data: users,
    };
  } catch (error) {
    console.error('Search users for role assignment error:', error);
    return {
      success: false,
      error: 'Failed to search users',
    };
  }
}
