import { FormCreateService } from '@/components';
import { getCurrentUser } from '@/actions/auth/server';
import { redirect } from 'next/navigation';
import React from 'react';
import { getDashboardMetadata } from '@/lib/seo/pages';
import { getServiceTaxonomies } from '@/lib/taxonomies';
import { tags } from '@/constants/datasets/tags';
import { getAllSubdivisions } from '@/lib/utils/datasets';

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

  // Prepare taxonomy data server-side to prevent client-side bundle bloat
  const serviceTaxonomies = getServiceTaxonomies();
  const subdivisions = getAllSubdivisions(serviceTaxonomies);
  const allSubdivisions = subdivisions.map((subdivision) => ({
    id: subdivision.id,
    label: `${subdivision.label}`,
    subdivision: subdivision,
    subcategory: subdivision.subcategory,
    category: subdivision.category,
  }));
  const availableTags = tags.map((tag) => ({
    value: tag.id,
    label: tag.label,
  }));

  return (
    <FormCreateService
      initialUser={user}
      initialProfile={profile}
      serviceTaxonomies={serviceTaxonomies}
      allSubdivisions={allSubdivisions}
      availableTags={availableTags}
    />
  );
}
