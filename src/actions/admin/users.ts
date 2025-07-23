'use server';

import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import {
  listUsersSchema,
  createAdminUserSchema,
  setRoleSchema,
  banUserSchema,
  unbanUserSchema,
  removeUserSchema,
  impersonateUserSchema,
  revokeSessionSchema,
  revokeUserSessionsSchema,
  updateAdminUserSchema,
  setUserPasswordSchema,
} from '@/lib/validations';

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

    console.log('Better Auth listUserSessions result:', result);

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
          role: updateFields.role as any // Type assertion for custom roles
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
        error: 'No supported fields to update. Only role updates are currently supported via Better Auth API.',
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
