import { Suspense } from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { unstable_cache } from 'next/cache';

import { getProfilesByFilters, getPopularProfileCategories } from '@/actions/profiles/get-profiles';
import { ArchiveLayout } from '@/components/archives/archive-layout';
import { ArchiveProfileCard } from '@/components/archives/archive-profile-card';
import { transformCoverageWithLocationNames } from '@/lib/utils/datasets';
import { findById, findBySlug } from '@/lib/utils/datasets';
import { proTaxonomies } from '@/constants/datasets/pro-taxonomies';
import type { ProfileFilters } from '@/actions/profiles/get-profiles';

// ISR Configuration
export const revalidate = 3600; // 1 hour
export const dynamicParams = true;

interface CompaniesCategoryPageProps {
  params: Promise<{ category: string }>;
  searchParams: Promise<{
    county?: string;
    online?: string;
    sortBy?: string;
    page?: string;
  }>;
}

// Generate static params for popular categories
export async function generateStaticParams() {
  const getCachedCategories = unstable_cache(
    async () => {
      const result = await getPopularProfileCategories();
      return result.success ? result.data : [];
    },
    ['company-archive-categories'],
    { revalidate: 3600, tags: ['profiles', 'categories'] }
  );

  const categories = await getCachedCategories();

  return categories.map((category) => ({
    category: category,
  }));
}

// Generate metadata
export async function generateMetadata({ params }: CompaniesCategoryPageProps): Promise<Metadata> {
  const { category } = await params;
  const categoryData = findBySlug(proTaxonomies, category);

  if (!categoryData) {
    return {
      title: 'Category Not Found | Doulitsa',
      description: 'The requested company category was not found.',
    };
  }

  const title = `${categoryData.name} Companies | Doulitsa`;
  const description = `Find verified ${categoryData.name.toLowerCase()} companies in Greece. Browse professional services, ratings, and coverage areas.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url: `/companies/${category}`,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function CompaniesCategoryPage({ params, searchParams }: CompaniesCategoryPageProps) {
  const { category } = await params;
  const resolvedSearchParams = await searchParams;

  // Validate category
  const categoryData = findBySlug(proTaxonomies, category);
  if (!categoryData) {
    notFound();
  }

  // Parse search parameters
  const filters: ProfileFilters = {
    category: categoryData.id,
    role: 'company',
    county: resolvedSearchParams.county,
    online: resolvedSearchParams.online === 'true',
    sortBy: resolvedSearchParams.sortBy as ProfileFilters['sortBy'] || 'default',
    page: parseInt(resolvedSearchParams.page || '1'),
    limit: 20,
  };

  // Fetch data with caching
  const getCachedProfiles = unstable_cache(
    async (filters: ProfileFilters) => {
      return await getProfilesByFilters(filters);
    },
    [`companies-category-${category}`],
    { revalidate: 1800, tags: ['profiles', 'companies', category] }
  );

  const result = await getCachedProfiles(filters);

  if (!result.success) {
    throw new Error('Failed to load companies');
  }

  const { profiles, total, hasMore } = result.data;

  // Transform coverage data for each profile
  const profilesWithCoverage = profiles.map(profile => ({
    profile,
    coverage: transformCoverageWithLocationNames(profile.coverage),
  }));

  // Prepare taxonomy data
  const taxonomyData = {
    featuredCategories: proTaxonomies.slice(0, 8),
    currentCategory: categoryData,
    currentSubcategory: undefined,
  };

  // Prepare breadcrumb data
  const breadcrumbData = {
    segments: [
      { label: 'Home', href: '/' },
      { label: 'Companies', href: '/companies' },
      { label: categoryData.name, href: `/companies/${category}` },
    ],
  };

  return (
    <ArchiveLayout
      archiveType="companies"
      category={category}
      initialFilters={filters}
      taxonomyData={taxonomyData}
      breadcrumbData={breadcrumbData}
    >
      <div className="space-y-6">
        {/* Results Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {categoryData.name} Companies
            </h1>
            <p className="text-gray-600 mt-1">
              {total} {total === 1 ? 'company' : 'companies'} found
            </p>
          </div>
        </div>

        {/* Results List */}
        <Suspense fallback={<div className="animate-pulse">Loading companies...</div>}>
          <div className="space-y-4">
            {profilesWithCoverage.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-lg mb-2">No companies found</div>
                <p className="text-gray-600">
                  Try adjusting your filters or search in a different category.
                </p>
              </div>
            ) : (
              profilesWithCoverage.map(({ profile, coverage }) => (
                <ArchiveProfileCard
                  key={profile.id}
                  profile={profile}
                  coverage={coverage}
                />
              ))
            )}
          </div>
        </Suspense>
      </div>
    </ArchiveLayout>
  );
}
