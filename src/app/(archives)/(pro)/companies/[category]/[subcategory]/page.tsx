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

interface CompaniesSubcategoryPageProps {
  params: Promise<{
    category: string;
    subcategory: string;
  }>;
  searchParams: Promise<{
    county?: string;
    online?: string;
    sortBy?: string;
    page?: string;
  }>;
}

// Generate static params for popular category/subcategory combinations
export async function generateStaticParams() {
  // Get popular categories first, then expand with subcategories
  const getCachedCombinations = unstable_cache(
    async () => {
      const categoriesResult = await getPopularProfileCategories();
      if (!categoriesResult.success) return [];

      const combinations: { category: string; subcategory: string }[] = [];

      // Generate combinations from taxonomy data
      proTaxonomies.forEach(category => {
        if (category.children) {
          category.children.forEach(subcategory => {
            combinations.push({
              category: category.slug,
              subcategory: subcategory.slug,
            });
          });
        }
      });

      return combinations.slice(0, 50); // Limit to 50 most popular combinations
    },
    ['company-archive-subcategories'],
    { revalidate: 3600, tags: ['profiles', 'categories', 'subcategories'] }
  );

  return await getCachedCombinations();
}

// Generate metadata
export async function generateMetadata({ params }: CompaniesSubcategoryPageProps): Promise<Metadata> {
  const { category, subcategory } = await params;

  const categoryData = findBySlug(proTaxonomies, category);
  if (!categoryData) {
    return {
      title: 'Category Not Found | Doulitsa',
      description: 'The requested company category was not found.',
    };
  }

  const subcategoryData = categoryData.children?.find(sub => sub.slug === subcategory);
  if (!subcategoryData) {
    return {
      title: 'Subcategory Not Found | Doulitsa',
      description: 'The requested company subcategory was not found.',
    };
  }

  const title = `${subcategoryData.name} Companies in ${categoryData.name} | Doulitsa`;
  const description = `Find verified ${subcategoryData.name.toLowerCase()} companies specializing in ${categoryData.name.toLowerCase()} in Greece. Browse professional services, ratings, and coverage areas.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url: `/companies/${category}/${subcategory}`,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function CompaniesSubcategoryPage({ params, searchParams }: CompaniesSubcategoryPageProps) {
  const { category, subcategory } = await params;
  const resolvedSearchParams = await searchParams;

  // Validate category and subcategory
  const categoryData = findBySlug(proTaxonomies, category);
  if (!categoryData) {
    notFound();
  }

  const subcategoryData = categoryData.children?.find(sub => sub.slug === subcategory);
  if (!subcategoryData) {
    notFound();
  }

  // Parse search parameters
  const filters: ProfileFilters = {
    category: categoryData.id,
    subcategory: subcategoryData.id,
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
    [`companies-subcategory-${category}-${subcategory}`],
    { revalidate: 1800, tags: ['profiles', 'companies', category, subcategory] }
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
    currentSubcategory: subcategoryData,
  };

  // Prepare breadcrumb data
  const breadcrumbData = {
    segments: [
      { label: 'Home', href: '/' },
      { label: 'Companies', href: '/companies' },
      { label: categoryData.name, href: `/companies/${category}` },
      { label: subcategoryData.name, href: `/companies/${category}/${subcategory}` },
    ],
  };

  return (
    <ArchiveLayout
      archiveType="companies"
      category={category}
      subcategory={subcategory}
      initialFilters={filters}
      taxonomyData={taxonomyData}
      breadcrumbData={breadcrumbData}
    >
      <div className="space-y-6">
        {/* Results Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {subcategoryData.name} Companies
            </h1>
            <p className="text-gray-600 mt-1">
              Specializing in {categoryData.name} • {total} {total === 1 ? 'company' : 'companies'} found
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
                  Try adjusting your filters or search in a different subcategory.
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
