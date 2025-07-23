'use server';

import { ActionResult } from '@/lib/types/api';

interface MaintenanceStatus {
  isUnderMaintenance: boolean;
  message?: string;
}

/**
 * Check if the application is under maintenance
 * This could be configured via environment variables or database
 */
export async function getMaintenanceStatus(): Promise<ActionResult<MaintenanceStatus>> {
  try {
    // Check environment variable for maintenance mode
    const isUnderMaintenance = process.env.MAINTENANCE_MODE === 'true';
    const message = process.env.MAINTENANCE_MESSAGE || 'The application is currently under maintenance. Please try again later.';

    return {
      success: true,
      data: {
        isUnderMaintenance,
        message: isUnderMaintenance ? message : undefined,
      },
    };
  } catch (error) {
    console.error('Error checking maintenance status:', error);
    return {
      success: false,
      error: 'Failed to check maintenance status',
    };
  }
}

/**
 * Check if user can access the application (not under maintenance or admin user)
 */
export async function canAccessApplication(): Promise<ActionResult<boolean>> {
  try {
    const maintenanceResult = await getMaintenanceStatus();
    
    if (!maintenanceResult.success) {
      return {
        success: false,
        error: 'Failed to check application access',
      };
    }

    const { isUnderMaintenance } = maintenanceResult.data;

    // If not under maintenance, allow access
    if (!isUnderMaintenance) {
      return {
        success: true,
        data: true,
      };
    }

    // If under maintenance, only allow admin users
    // This could be expanded to check user role
    return {
      success: true,
      data: false,
    };
  } catch (error) {
    console.error('Error checking application access:', error);
    return {
      success: false,
      error: 'Failed to check application access',
    };
  }
}