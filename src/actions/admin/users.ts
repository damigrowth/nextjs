'use server';

import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';
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
} from '@/lib/validations/admin';

// Import types from centralized validation schemas
import type { CreateUserInput, UpdateUserInput } from '@/lib/validations';

// Helper function to get authenticated admin session with API key validation
async function getAdminSession() {
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });

  if (!session?.user) {
    redirect('/login');
  }

  // Check if user has admin role
  const isAdmin = session.user.role === 'admin';

  if (!isAdmin) {
    throw new Error('Unauthorized: Admin role required');
  }

  // Additional API key validation could be added here if needed
  // For now, we rely on the AdminGuard component to validate API keys client-side
  // and the server-side session management to ensure secure access

  return session;
}

// Admin Actions using correct Better Auth API methods
export async function getUser(userId: string) {
  try {
    await getAdminSession();

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
        sessions: true,
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
  params: Partial<z.infer<typeof adminListUsersSchema>> = {},
) {
  try {
    await getAdminSession();

    const validatedParams = adminListUsersSchema.parse(params);

    // Transform our schema to Better Auth compatible query format
    const betterAuthQuery = {
      limit: validatedParams.limit || 10,
      offset: validatedParams.offset || 0,
      sortBy: validatedParams.sortBy || 'createdAt',
      sortDirection: validatedParams.sortDirection || ('desc' as const),
      searchField: validatedParams.searchField,
      searchValue: validatedParams.searchValue,
      // Map our filter operators to Better Auth compatible ones
      filterField: validatedParams.filterField,
      filterValue: validatedParams.filterValue,
      filterOperator:
        validatedParams.filterOperator === 'starts_with'
          ? ('contains' as const)
          : (validatedParams.filterOperator as any),
    };

    // Use the correct Better Auth admin listUsers method
    const result = await auth.api.listUsers({
      query: betterAuthQuery,
      headers: await headers(),
    });

    return {
      success: true,
      data: result,
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
    await getAdminSession();

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
    await getAdminSession();

    const validatedData = adminSetRoleSchema.parse(data);

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
    await getAdminSession();

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
    await getAdminSession();

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
    await getAdminSession();

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
    await getAdminSession();

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
    await getAdminSession();

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
    await getAdminSession();

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
    await getAdminSession();

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
    await getAdminSession();

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
    await getAdminSession();

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
    await getAdminSession();

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
 * Fields: name, email, username, displayName, firstName, lastName
 */
export async function updateUserBasicInfo(data: {
  userId: string;
  name?: string;
  email?: string;
  username?: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
}) {
  try {
    await getAdminSession();

    const { prisma } = await import('@/lib/prisma/client');

    // Build update object with only provided fields
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.username !== undefined) updateData.username = data.username;
    if (data.displayName !== undefined) updateData.displayName = data.displayName;
    if (data.firstName !== undefined) updateData.firstName = data.firstName;
    if (data.lastName !== undefined) updateData.lastName = data.lastName;

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
      error: error instanceof Error ? error.message : 'Failed to update user basic info',
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
  step?: string;
}) {
  try {
    await getAdminSession();

    const { prisma } = await import('@/lib/prisma/client');

    // Build update object with only provided fields
    const updateData: any = {};
    if (data.confirmed !== undefined) updateData.confirmed = data.confirmed;
    if (data.blocked !== undefined) updateData.blocked = data.blocked;
    if (data.emailVerified !== undefined) updateData.emailVerified = data.emailVerified;
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
      error: error instanceof Error ? error.message : 'Failed to update user status',
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
    await getAdminSession();

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
      error: error instanceof Error ? error.message : 'Failed to update user ban status',
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
    await getAdminSession();

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
      error: error instanceof Error ? error.message : 'Failed to update user image',
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
    await getAdminSession();

    const { prisma } = await import('@/lib/prisma/client');

    const user = await prisma.user.update({
      where: { id: data.userId },
      data: { blocked: data.blocked },
    });

    return {
      success: true,
      data: user,
      message: data.blocked ? 'User blocked successfully' : 'User unblocked successfully',
    };
  } catch (error) {
    console.error('Error toggling user block status:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to toggle user block status',
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
    await getAdminSession();

    const { prisma } = await import('@/lib/prisma/client');

    const user = await prisma.user.update({
      where: { id: data.userId },
      data: { confirmed: data.confirmed },
    });

    return {
      success: true,
      data: user,
      message: data.confirmed ? 'User confirmed successfully' : 'User unconfirmed successfully',
    };
  } catch (error) {
    console.error('Error toggling user confirmation:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to toggle user confirmation',
    };
  }
}

/**
 * Update user journey step via Prisma
 */
export async function updateUserJourneyStep(data: {
  userId: string;
  step: string;
}) {
  try {
    await getAdminSession();

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
      error: error instanceof Error ? error.message : 'Failed to update user journey step',
    };
  }
}
