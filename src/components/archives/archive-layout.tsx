'use client';

import { ReactNode } from 'react';
import { ArchiveFilters } from './archive-filters';
import { ArchiveSidebar } from './archive-sidebar';
import { ArchivePagination } from './archive-pagination';
import { ArchiveBanner } from './archive-banner';
import { TaxonomyTabs, DynamicBreadcrumb } from '@/components';

import type { DatasetItem } from '@/lib/types/datasets';
import { FilterState } from '@/hooks/archives/use-archive-filters';
import { useArchiveFilters } from '@/hooks/archives/use-archive-filters';
import { useArchivePagination } from '@/hooks/archives/use-archive-pagination';
import clsx from 'clsx';

interface ArchiveLayoutProps {
  children: ReactNode;
  archiveType: 'pros' | 'companies' | 'services';
  category?: string;
  subcategory?: string;
  subdivision?: string; // For services
  initialFilters?: FilterState;
  taxonomyData: {
    categories: DatasetItem[];
    currentCategory?: DatasetItem;
    currentSubcategory?: DatasetItem;
    currentSubdivision?: DatasetItem; // For services
    subcategories?: DatasetItem[]; // Filtered subcategories that have services
    subdivisions?: DatasetItem[]; // Filtered subdivisions that have services
  };
  breadcrumbData?: {
    segments: Array<{
      label: string;
      href?: string;
    }>;
    buttons?: Array<{
      label: string;
      href: string;
    }>;
  };
  counties: DatasetItem[];
  className?: string;
  basePath: string;
  total?: number;
  limit?: number;
  hasMore?: boolean;
  onFiltersChange?: (filters: any) => void;
  onLimitChange?: (limit: number) => void;
  showResultsPerPage?: boolean;
  isLoading?: boolean;
}

export function ArchiveLayout({
  children,
  archiveType,
  category,
  subcategory,
  subdivision,
  initialFilters = {},
  taxonomyData,
  breadcrumbData,
  counties,
  className,
  basePath,
  total = 0,
  limit = 20,
  hasMore = false,
  onFiltersChange,
  onLimitChange,
  showResultsPerPage = true,
  isLoading = false,
}: ArchiveLayoutProps) {
  // Initialize filters with route params
  const routeFilters: FilterState = {
    ...initialFilters,
    ...(category && { category }),
    ...(subcategory && { subcategory }),
    ...(subdivision && { subdivision }),
  };

  const {
    filters,
    handleFiltersChange,
    handlePageChange,
    handleLimitChange,
    clearFilters,
    getActiveFilterCount,
    buildAPIFilters,
  } = useArchiveFilters({
    initialFilters: routeFilters,
    basePath,
  });

  const pagination = useArchivePagination({
    initialPage: filters.page || 1,
    limit,
    total,
    hasMore,
    onPageChange: handlePageChange,
  });

  // Handle filter changes and notify parent
  const handleFiltersUpdate = (newFilters: FilterState) => {
    handleFiltersChange(newFilters);
    if (onFiltersChange) {
      onFiltersChange(newFilters);
    }
  };

  // Handle limit changes and notify parent
  const handleLimitUpdate = (newLimit: number) => {
    handleLimitChange(newLimit);
    if (onLimitChange) {
      onLimitChange(newLimit);
    }
  };

  // Determine archive type for sidebar
  const sidebarArchiveType =
    archiveType === 'pros' || archiveType === 'companies'
      ? 'profiles'
      : 'services';

  return (
    <div className={clsx(className, 'py-20')}>
      {/* Category Navigation Tabs */}
      {archiveType === 'services' && (
        <TaxonomyTabs
          items={taxonomyData.categories}
          basePath='services'
          allItemsLabel='Όλες οι Υπηρεσίες'
          activeItemSlug={taxonomyData.currentCategory?.slug}
          usePluralLabels={false}
        />
      )}

      {/* Breadcrumb Navigation */}
      {breadcrumbData && (
        <DynamicBreadcrumb
          segments={breadcrumbData.segments}
          // buttons={breadcrumbData.buttons}
        />
      )}

      {/* Archive Banner - Services only */}
      {archiveType === 'services' && (
        <ArchiveBanner
          title={
            taxonomyData.currentSubdivision
              ? `${taxonomyData.currentSubdivision.label} - ${taxonomyData.currentSubcategory?.label}`
              : taxonomyData.currentSubcategory
              ? `${taxonomyData.currentSubcategory.label} - ${taxonomyData.currentCategory?.label}`
              : taxonomyData.currentCategory
              ? taxonomyData.currentCategory.label
              : 'Όλες οι Υπηρεσίες'
          }
          subtitle={
            taxonomyData.currentSubdivision?.description ||
            taxonomyData.currentSubcategory?.description ||
            taxonomyData.currentCategory?.description ||
            'Ανακάλυψε τις καλύτερες υπηρεσίες για οποιαδήποτε ανάγκη, από τους καλύτερους επαγγελματίες.'
          }
        />
      )}

      {/* Archive Content */}
      <section>
        <div className='container mx-auto px-4'>
          <div className='max-w-5xl mx-auto'>
            {/* Filters with integrated sidebar */}
            <ArchiveSidebar
              filters={filters}
              onFiltersChange={handleFiltersUpdate}
              archiveType={sidebarArchiveType}
              categories={taxonomyData.categories}
              counties={counties}
              subcategories={taxonomyData.subcategories}
              subdivisions={taxonomyData.subdivisions}
            >
              <ArchiveFilters
                filters={filters}
                onFiltersChange={handleFiltersUpdate}
                counties={counties}
                activeFilterCount={getActiveFilterCount}
              />
            </ArchiveSidebar>

            {/* Results Summary */}
            <div className='bg-white border-b border-gray-200'>
              <div className='container mx-auto px-4 py-4'>
                <div className='flex items-center justify-between'>
                  <div className='text-sm text-gray-600'>
                    {total > 0 ? (
                      <>
                        Εμφανίζονται {pagination.startItem}-{pagination.endItem}{' '}
                        από {total} αποτελέσματα
                      </>
                    ) : (
                      'Δεν βρέθηκαν αποτελέσματα'
                    )}
                  </div>

                  {/* Clear filters button */}
                  <button
                    onClick={clearFilters}
                    disabled={getActiveFilterCount === 0}
                    className={`text-sm transition-colors ${
                      getActiveFilterCount > 0
                        ? 'text-red-600 hover:text-red-700 cursor-pointer'
                        : 'text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Καθαρισμός φίλτρων ({getActiveFilterCount})
                  </button>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className='container mx-auto px-4 py-6'>
              {children}

              {/* Pagination */}
              {pagination.isPaginationNeeded && (
                <ArchivePagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  total={pagination.total}
                  startItem={pagination.startItem}
                  endItem={pagination.endItem}
                  limit={limit}
                  isLoading={isLoading}
                  onPageChange={pagination.handlePageChange}
                  onLimitChange={handleLimitUpdate}
                  showResultsPerPage={showResultsPerPage}
                  className='mt-8'
                />
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
