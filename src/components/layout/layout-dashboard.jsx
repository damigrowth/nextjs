import React from 'react';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { ActiveDashboard, InactiveDashboard } from '../wrapper';
import { getFreelancerActivationStatus } from '@/actions/shared/freelancer';
import { getToken } from '@/actions/auth/token';

export default async function DashboardLayout({ children }) {
  const token = await getToken();

  if (!token) {
    redirect('/login');
  }

  const freelancer = await getFreelancerActivationStatus();

  const isActive = freelancer?.isActive;
  console.log('Layout isActive:', isActive);

  // Get the current path to check if it's start or success page
  // Check if we're on the success page via middleware header
  const headersList = await headers();

  const currentPath = headersList.get('x-current-path') || '';
  console.log('Layout current path:', currentPath);

  // Show inactive layout for both /dashboard/start and /dashboard/saved/success
  const isOnboardingPath = currentPath.startsWith('/dashboard/start');

  const isSuccessPath = currentPath === '/dashboard/saved/success';

  const shouldShowInactiveDashboard =
    !isActive || isOnboardingPath || isSuccessPath;

  return shouldShowInactiveDashboard ? (
    <InactiveDashboard>{children}</InactiveDashboard>
  ) : (
    <ActiveDashboard>{children}</ActiveDashboard>
  );
}
