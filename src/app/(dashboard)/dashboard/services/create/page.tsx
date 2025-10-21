import { FormCreateService } from '@/components';
import { getCurrentUser } from '@/actions/auth/server';
import { redirect } from 'next/navigation';
import React from 'react';
import { getDashboardMetadata } from '@/lib/seo/pages';

export const metadata = getDashboardMetadata('Δημιουργία Υπηρεσίας');

export default async function CreateServicePage() {
  // Fetch current user server-side
  const userResult = await getCurrentUser();

  if (!userResult.success || !userResult.data.user) {
    redirect('/login');
  }

  const { user, profile } = userResult.data;

  // Check if user can create services (only professionals)
  if (user.role !== 'freelancer' && user.role !== 'company') {
    redirect('/dashboard');
  }

  return <FormCreateService initialUser={user} initialProfile={profile} />;
}
