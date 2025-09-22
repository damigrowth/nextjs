import { Suspense } from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { unstable_cache } from 'next/cache';
import Link from 'next/link';

import { getProfilesByFilters } from '@/actions/profiles/get-profiles';
import { getServicesByFilters } from '@/actions/services/get-services';
import { ArchiveProfileCard } from '@/components/archives/archive-profile-card';
import { ArchiveServiceCard } from '@/components/archives/archive-service-card';
import { transformCoverageWithLocationNames } from '@/lib/utils/datasets';
import { findById, findBySlug } from '@/lib/utils/datasets';
import { proTaxonomies } from '@/constants/datasets/pro-taxonomies';
import { serviceTaxonomies } from '@/constants/datasets/service-taxonomies';
import type { ProfileFilters } from '@/actions/profiles/get-profiles';
import type { ServiceFilters } from '@/actions/services/get-services';

// ISR Configuration
export const revalidate = 3600; // 1 hour
export const dynamicParams = true;

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Generate static params for popular categories
export async function generateStaticParams() {
  const getCachedCategories = unstable_cache(
    async () => {
      // Combine both pro and service categories
      const allCategories = [
        ...proTaxonomies.map(cat => cat.slug),
        ...serviceTaxonomies.map(cat => cat.slug),
      ];

      // Remove duplicates and return unique category slugs
      return [...new Set(allCategories)];
    },
    ['category-landing-pages'],
    { revalidate: 3600, tags: ['categories'] }
  );

  const categories = await getCachedCategories();

  return categories.map((slug) => ({
    slug: slug,
  }));
}

// Generate metadata
export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;

  // Try to find category in both taxonomies
  const proCategoryData = findBySlug(proTaxonomies, slug);
  const serviceCategoryData = findBySlug(serviceTaxonomies, slug);

  const categoryData = proCategoryData || serviceCategoryData;

  if (!categoryData) {
    return {
      title: 'Category Not Found | Doulitsa',
      description: 'The requested category was not found.',
    };
  }

  const title = `${categoryData.name} Professionals & Services | Doulitsa`;
  const description = `Discover ${categoryData.name.toLowerCase()} professionals and services in Greece. Find verified freelancers, companies, and service providers with ratings and coverage areas.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url: `/categories/${slug}`,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;

  // Try to find category in both taxonomies
  const proCategoryData = findBySlug(proTaxonomies, slug);
  const serviceCategoryData = findBySlug(serviceTaxonomies, slug);

  const categoryData = proCategoryData || serviceCategoryData;

  if (!categoryData) {
    notFound();
  }

  // Fetch featured content from both profiles and services
  const getCachedData = unstable_cache(
    async (categoryId: string) => {
      const profileFilters: ProfileFilters = {
        category: categoryId,
        published: true,
        limit: 6,
        sortBy: 'default', // Featured first
      };

      const serviceFilters: ServiceFilters = {
        category: categoryId,
        status: 'active',
        limit: 6,
        sortBy: 'default', // Featured first
      };

      const [profilesResult, servicesResult] = await Promise.all([
        getProfilesByFilters(profileFilters),
        getServicesByFilters(serviceFilters),
      ]);

      return {
        profiles: profilesResult.success ? profilesResult.data.profiles : [],
        services: servicesResult.success ? servicesResult.data.services : [],
      };
    },
    [`category-hub-${slug}`],
    { revalidate: 1800, tags: ['categories', 'profiles', 'services', slug] }
  );

  const { profiles, services } = await getCachedData(categoryData.id);

  // Transform coverage data
  const profilesWithCoverage = profiles.map(profile => ({
    profile,
    coverage: transformCoverageWithLocationNames(profile.coverage),
  }));

  const servicesWithCoverage = services.map(service => ({
    service,
    coverage: transformCoverageWithLocationNames(service.profile.coverage),
  }));

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {categoryData.name}
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Discover verified professionals and services in {categoryData.name.toLowerCase()}.
          Browse freelancers, companies, and specialized services with ratings and reviews.
        </p>
      </div>

      {/* Navigation Links */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <Link
          href={`/pros?category=${slug}`}
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            👤 Freelancers
          </h3>
          <p className="text-gray-600">
            Independent {categoryData.name.toLowerCase()} professionals
          </p>
        </Link>

        <Link
          href={`/companies?category=${slug}`}
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            🏢 Companies
          </h3>
          <p className="text-gray-600">
            Professional {categoryData.name.toLowerCase()} companies
          </p>
        </Link>

        <Link
          href={`/services?category=${slug}`}
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            🛍️ Services
          </h3>
          <p className="text-gray-600">
            Ready-to-order {categoryData.name.toLowerCase()} services
          </p>
        </Link>
      </div>

      {/* Featured Professionals */}
      {profiles.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Featured Professionals
            </h2>
            <Link
              href={`/pros?category=${slug}`}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              View all →
            </Link>
          </div>

          <Suspense fallback={<div className="animate-pulse">Loading professionals...</div>}>
            <div className="grid gap-4">
              {profilesWithCoverage.slice(0, 3).map(({ profile, coverage }) => (
                <ArchiveProfileCard
                  key={profile.id}
                  profile={profile}
                  coverage={coverage}
                />
              ))}
            </div>
          </Suspense>
        </section>
      )}

      {/* Featured Services */}
      {services.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Featured Services
            </h2>
            <Link
              href={`/services?category=${slug}`}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              View all →
            </Link>
          </div>

          <Suspense fallback={<div className="animate-pulse">Loading services...</div>}>
            <div className="grid gap-4">
              {servicesWithCoverage.slice(0, 3).map(({ service, coverage }) => (
                <ArchiveServiceCard
                  key={service.id}
                  service={service}
                  coverage={coverage}
                />
              ))}
            </div>
          </Suspense>
        </section>
      )}

      {/* Subcategories */}
      {categoryData.children && categoryData.children.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Browse by Specialization
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryData.children.map((subcategory) => (
              <Link
                key={subcategory.id}
                href={`/categories/${subcategory.slug}`}
                className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <h3 className="font-medium text-gray-900 mb-1">
                  {subcategory.name}
                </h3>
                {subcategory.description && (
                  <p className="text-sm text-gray-600">
                    {subcategory.description}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Empty State */}
      {profiles.length === 0 && services.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-2">No content available yet</div>
          <p className="text-gray-600">
            This category is being prepared. Check back soon for professionals and services.
          </p>
        </div>
      )}
    </div>
  );
}
