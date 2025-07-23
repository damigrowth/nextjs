'use server';

import { getCurrentUser } from '@/actions/auth/check-auth';
import { PrismaClient } from '@prisma/client';
import { ActionResult } from '@/lib/types/api';
import { onboardingSchema } from '@/lib/validations/auth';

const prisma = new PrismaClient();

interface OnboardingData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  city?: string;
  county?: string;
  zipcode?: string;
  username?: string;
  displayName?: string;
  tagline?: string;
  description?: string;
  website?: string;
  experience?: string | number;
  rate?: string | number;
}

/**
 * Server action to complete onboarding and update user step
 * Updates user step from 'ONBOARDING' to 'DASHBOARD'
 * Also creates or updates user profile with onboarding data
 */
export async function completeOnboarding(profileData: OnboardingData = {}): Promise<ActionResult<void>> {
  try {
    const userResult = await getCurrentUser();
    
    if (!userResult.success || !userResult.data) {
      return { 
        success: false, 
        error: 'User not authenticated' 
      };
    }

    const user = userResult.data as any;

    if (user.step !== 'ONBOARDING') {
      return { 
        success: false, 
        error: 'User not in onboarding step' 
      };
    }

    // Update user step to DASHBOARD
    await prisma.user.update({
      where: { id: user.id },
      data: {
        step: 'DASHBOARD',
        confirmed: true,
      },
    });

    // Create or update profile with onboarding data
    if (Object.keys(profileData).length > 0) {
      await prisma.profile.upsert({
        where: { uid: user.id },
        update: {
          // Profile fields from onboarding
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          phone: profileData.phone,
          city: profileData.city,
          county: profileData.county,
          zipcode: profileData.zipcode,
          username: profileData.username || user.username,
          displayName: profileData.displayName || user.displayName,
          // Professional fields
          tagline: profileData.tagline,
          description: profileData.description,
          website: profileData.website,
          experience: profileData.experience ? parseInt(profileData.experience) : null,
          rate: profileData.rate ? parseInt(profileData.rate) : null,
          published: user.role !== 'user', // Publish profile for professionals
          isActive: true,
        },
        create: {
          uid: user.id,
          // Profile fields from onboarding
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          phone: profileData.phone,
          city: profileData.city,
          county: profileData.county,
          zipcode: profileData.zipcode,
          username: profileData.username || user.username,
          displayName: profileData.displayName || user.displayName,
          // Professional fields
          tagline: profileData.tagline,
          description: profileData.description,
          website: profileData.website,
          experience: profileData.experience ? parseInt(profileData.experience) : null,
          rate: profileData.rate ? parseInt(profileData.rate) : null,
          published: user.role !== 'user', // Publish profile for professionals
          isActive: true,
        },
      });
    }

    return { 
      success: true
    };

  } catch (error) {
    console.error('Error completing onboarding:', error);
    return { 
      success: false, 
      error: 'Failed to complete onboarding' 
    };
  }
}