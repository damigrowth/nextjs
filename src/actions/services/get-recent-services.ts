'use server';

import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma/client';
import type { ActionResult } from '@/lib/types/api';

export interface RecentService {
  id: string;
  title: string;
}

export async function getRecentServices(): Promise<
  ActionResult<RecentService[]>
> {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { success: false, error: 'Authentication required' };
    }

    // Get user profile
    const profile = await prisma.profile.findUnique({
      where: { uid: session.user.id },
    });

    if (!profile) {
      return { success: false, error: 'Profile not found' };
    }

    // Get last 5 services ordered by updatedAt desc
    const services = await prisma.service.findMany({
      where: {
        pid: profile.id,
      },
      select: {
        id: true,
        title: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: 5,
    });

    // Transform data to match RecentService interface
    const transformedServices: RecentService[] = services.map(service => ({
      id: service.id.toString(),
      title: service.title,
    }));

    return {
      success: true,
      data: transformedServices,
    };
  } catch (error) {
    console.error('Get recent services error:', error);
    return {
      success: false,
      error: 'Failed to fetch recent services',
    };
  }
}