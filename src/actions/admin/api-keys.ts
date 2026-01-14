'use server';

import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import {
  validateApiKeySchema,
  createAdminApiKeySchema,
  updateAdminApiKeySchema,
} from '@/lib/validations/admin';
import { getAdminSession, getAdminSessionWithPermission } from './helpers';
import { ADMIN_RESOURCES } from '@/lib/auth/roles';

// Environment admin API keys (fallback for initial access)
const ADMIN_API_KEYS =
  process.env.ADMIN_API_KEYS?.split(',').filter(Boolean) || [];

/**
 * Validate an admin API key (environment or database)
 */
export async function validateAdminApiKey(data: { apiKey: string }) {
  try {
    const { apiKey } = validateApiKeySchema.parse(data);

    // First check environment variables (for initial access)
    if (ADMIN_API_KEYS.includes(apiKey)) {
      return {
        success: true,
        valid: true,
        source: 'environment',
        data: {
          name: 'Environment Admin Key',
          metadata: { purpose: 'initial-access' },
        },
      };
    }

    // Then check database API keys
    const result = await auth.api.verifyApiKey({
      body: {
        key: apiKey,
        permissions: {
          admin: ['read', 'write'],
        },
      },
    });

    if (result.valid && result.key) {
      return {
        success: true,
        valid: true,
        source: 'database',
        data: result.key,
      };
    }

    return {
      success: true,
      valid: false,
      source: null,
      data: null,
    };
  } catch (error) {
    console.error('Error validating admin API key:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to validate API key',
    };
  }
}

/**
 * Create a new admin API key (requires existing admin access)
 */
export async function createAdminApiKey(data: {
  name: string;
  expiresIn?: number;
  metadata?: { purpose?: string; owner?: string };
}) {
  try {
    const session = await getAdminSessionWithPermission(ADMIN_RESOURCES.SETTINGS, 'edit');
    const validatedData = createAdminApiKeySchema.parse(data);

    const result = await auth.api.createApiKey({
      body: {
        name: validatedData.name,
        expiresIn: validatedData.expiresIn * 24 * 60 * 60, // Convert days to seconds
        permissions: {
          admin: ['read', 'write', 'delete'],
          users: ['read', 'write', 'delete'],
          sessions: ['read', 'delete'],
        },
        metadata: {
          purpose: 'admin-access',
          createdBy: session.user.id,
          createdByEmail: session.user.email,
          ...validatedData.metadata,
        },
        rateLimitEnabled: true,
        rateLimitTimeWindow: 1000 * 60 * 60, // 1 hour
        rateLimitMax: 1000, // 1000 requests per hour
      },
      headers: await headers(),
    });

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error('Error creating admin API key:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to create API key',
    };
  }
}

/**
 * List all admin API keys for the current user
 */
export async function listAdminApiKeys() {
  try {
    await getAdminSessionWithPermission(ADMIN_RESOURCES.SETTINGS, 'view');

    const result = await auth.api.listApiKeys({
      headers: await headers(),
    });

    // Filter for admin keys only
    const adminKeys = result.filter(
      (key: any) =>
        key.permissions?.admin && key.metadata?.purpose === 'admin-access',
    );

    return {
      success: true,
      data: adminKeys,
    };
  } catch (error) {
    console.error('Error listing admin API keys:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to list API keys',
    };
  }
}

/**
 * Update an admin API key
 */
export async function updateAdminApiKey(
  keyId: string,
  data: { name?: string; enabled?: boolean },
) {
  try {
    await getAdminSessionWithPermission(ADMIN_RESOURCES.SETTINGS, 'edit');

    const result = await auth.api.updateApiKey({
      body: {
        keyId,
        name: data.name,
        enabled: data.enabled,
      },
      headers: await headers(),
    });

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error('Error updating admin API key:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to update API key',
    };
  }
}

/**
 * Delete an admin API key
 */
export async function deleteAdminApiKey(keyId: string) {
  try {
    await getAdminSessionWithPermission(ADMIN_RESOURCES.SETTINGS, 'view');

    const result = await auth.api.deleteApiKey({
      body: {
        keyId,
      },
      headers: await headers(),
    });

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error('Error deleting admin API key:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to delete API key',
    };
  }
}

/**
 * Check if the current session has admin API key access
 */
export async function checkAdminApiAccess() {
  try {
    const session = await getAdminSessionWithPermission(ADMIN_RESOURCES.SETTINGS, 'view');

    // Check if session was created with a valid admin API key
    // This would be stored in session metadata when API key is used
    return {
      success: true,
      hasAccess: true,
      user: session.user,
    };
  } catch (error) {
    return {
      success: false,
      hasAccess: false,
      error: error instanceof Error ? error.message : 'No admin access',
    };
  }
}
