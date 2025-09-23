'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { OnlineToggle, CountiesDropdown, CategoryDropdown, SubcategoryDropdown, SubdivisionDropdown } from './archive-inputs';
import type { DatasetItem } from '@/lib/types/datasets';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface FilterState {
  category?: string;
  subcategory?: string;
  subdivision?: string; // For services 3-level hierarchy
  county?: string; // Single county selection
  online?: boolean;
  sortBy?: string; // Sort option selection
}

interface ArchiveSidebarFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  archiveType: 'profiles' | 'services';
  categories: DatasetItem[];
  counties: DatasetItem[];
  subcategories?: DatasetItem[]; // Filtered subcategories that have services
  subdivisions?: DatasetItem[]; // Filtered subdivisions that have services
}

export function ArchiveSidebarFilters({
  filters,
  onFiltersChange,
  archiveType,
  categories,
  counties,
  subcategories,
  subdivisions,
}: ArchiveSidebarFiltersProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Parse current path to get taxonomy from route
  const pathSegments = pathname.split('/').filter(Boolean);

  // Determine base path from current pathname (since both pros and companies use archiveType='profiles')
  let baseArchivePath;
  if (archiveType === 'services') {
    baseArchivePath = '/ipiresies';
  } else if (archiveType === 'profiles') {
    // Check if we're in pros or companies based on current pathname
    if (pathname.startsWith('/companies')) {
      baseArchivePath = '/companies';
    } else {
      baseArchivePath = '/pros';
    }
  } else {
    // Fallback (shouldn't happen)
    baseArchivePath = '/' + pathSegments[0];
  }

  // Get current category/subcategory/subdivision from path based on archive type
  let currentCategorySlug, currentSubcategorySlug, currentSubdivisionSlug;

  if (archiveType === 'services') {
    // Services: /ipiresies/[subcategory]/[subdivision] (no category level)
    currentSubcategorySlug = pathSegments[1];
    currentSubdivisionSlug = pathSegments[2];
  } else {
    // Pros/Companies: /pros/[category]/[subcategory] or /companies/[category]/[subcategory]
    currentCategorySlug = pathSegments[1];
    currentSubcategorySlug = pathSegments[2];
  }

  // Find current category, subcategory and subdivision from available lists
  const currentCategory = currentCategorySlug ?
    categories.find(cat => cat.slug === currentCategorySlug) : null;

  const currentSubcategory = currentSubcategorySlug ?
    subcategories?.find(sub => sub.slug === currentSubcategorySlug) : null;

  const currentSubdivision = currentSubdivisionSlug ?
    subdivisions?.find(div => div.slug === currentSubdivisionSlug) : null;

  // Use only filtered subcategories and subdivisions from server action
  const availableSubcategories = subcategories || [];
  const availableSubdivisions = subdivisions || [];

  const handleFilterChange = <K extends keyof FilterState>(
    key: K,
    value: FilterState[K] | 'all' | ''
  ) => {
    // Don't handle taxonomy filters here - they're handled by navigation
    if (key === 'category' || key === 'subcategory' || key === 'subdivision') {
      return;
    }

    const newFilters = { ...filters };

    if (value === 'all' || value === '' || value === undefined) {
      delete newFilters[key];
    } else {
      newFilters[key] = value as FilterState[K];
    }

    // Remove any taxonomy params that might have been added
    delete newFilters.category;
    delete newFilters.subcategory;
    delete newFilters.subdivision;

    onFiltersChange(newFilters);
  };

  // Handle category change - navigate to category route for profiles
  const handleCategoryChange = (categoryId: string) => {
    if (!categoryId) {
      router.push(buildUrl(baseArchivePath));
      return;
    }

    // For services, we removed categories from URLs, so redirect to main page
    if (archiveType === 'services') {
      router.push(buildUrl(baseArchivePath));
      return;
    }

    // For profiles (pros/companies), navigate to category-specific route
    const category = categories.find(cat => cat.id === categoryId);
    if (!category) return;

    const path = `${baseArchivePath}/${category.slug}`;
    router.push(buildUrl(path));
  };

  // Handle subcategory change
  const handleSubcategoryChange = (subcategoryId: string) => {
    if (!subcategoryId) {
      // For pros/companies, go back to category page if we have a current category
      if (archiveType === 'profiles' && currentCategory) {
        router.push(buildUrl(`${baseArchivePath}/${currentCategory.slug}`));
      } else {
        router.push(buildUrl(baseArchivePath));
      }
      return;
    }

    const subcategory = availableSubcategories.find(sub => sub.id === subcategoryId);
    if (!subcategory) return;

    let path;
    if (archiveType === 'services') {
      // Services: /ipiresies/[subcategory]
      path = `${baseArchivePath}/${subcategory.slug}`;
    } else {
      // Pros/Companies: /pros/[category]/[subcategory] or /companies/[category]/[subcategory]
      if (!currentCategory) return; // Need category for pros/companies
      path = `${baseArchivePath}/${currentCategory.slug}/${subcategory.slug}`;
    }

    router.push(buildUrl(path));
  };

  // Handle subdivision change
  const handleSubdivisionChange = (subdivisionId: string) => {
    if (!currentSubcategory) return;

    if (!subdivisionId) {
      const path = `${baseArchivePath}/${currentSubcategory.slug}`;
      router.push(buildUrl(path));
      return;
    }

    const subdivision = availableSubdivisions.find(div => div.id === subdivisionId);
    if (!subdivision) return;

    const path = `${baseArchivePath}/${currentSubcategory.slug}/${subdivision.slug}`;
    router.push(buildUrl(path));
  };

  const handleClearAll = () => {
    // Clear only non-taxonomy filters
    const clearedFilters: FilterState = {};
    onFiltersChange(clearedFilters);
  };

  // Build URL with preserved query params (except taxonomy)
  const buildUrl = (path: string) => {
    const params = new URLSearchParams();

    // Only copy non-taxonomy and non-system params
    searchParams.forEach((value, key) => {
      // Skip taxonomy params that are now in the route and system filters that are handled internally
      if (key !== 'category' && key !== 'subcategory' && key !== 'subdivision' && key !== 'role' && key !== 'published') {
        params.append(key, value);
      }
    });

    const queryString = params.toString();
    return queryString ? `${path}?${queryString}` : path;
  };

  // Only count filters that represent actual user selections from search params
  const activeFilterCount = Object.entries(filters).filter(([key, value]) => {
    // System/navigation filters - not user-applied
    const systemFilters = ['page', 'limit', 'status', 'archiveType', 'role', 'published'];
    if (systemFilters.includes(key)) {
      return false;
    }

    // Taxonomy filters from route - not user-applied search param filters
    const taxonomyFilters = ['category', 'subcategory', 'subdivision'];
    if (taxonomyFilters.includes(key)) {
      return false;
    }

    // Default or empty values - not active filters
    if (value === undefined || value === null || value === false ||
        value === '' || value === 'all' || value === 'default') {
      return false;
    }

    // Only count meaningful user selections from search params
    return true;
  }).length;

  return (
    <>
      <div className='space-y-6'>
        {/* Category Selection - Only for pros and companies, not services */}
        {archiveType === 'profiles' && (
          <div className='space-y-3'>
            <Label className='text-sm font-medium'>Κατηγορία</Label>
            <CategoryDropdown
              value={currentCategory?.id}
              onValueChange={handleCategoryChange}
              categories={categories}
              placeholder='Όλες οι κατηγορίες'
              allLabel='Όλες οι κατηγορίες'
            />
          </div>
        )}

        {/* Subcategory Selection */}
        <div className='space-y-3'>
          <Label className='text-sm font-medium'>
            {archiveType === 'services' ? 'Κατηγορία' : 'Υποκατηγορία'}
          </Label>
          <SubcategoryDropdown
            value={currentSubcategory?.id}
            onValueChange={handleSubcategoryChange}
            subcategories={availableSubcategories}
            disabled={archiveType === 'profiles' ? !currentCategory : false}
            placeholder={archiveType === 'services' ? 'Όλες οι κατηγορίες' : 'Όλες οι υποκατηγορίες'}
            allLabel={archiveType === 'services' ? 'Όλες οι κατηγορίες' : 'Όλες οι υποκατηγορίες'}
          />
        </div>

        {/* Subdivision Selection - Services only */}
        {archiveType === 'services' && (
          <div className='space-y-3'>
            <Label className='text-sm font-medium'>Υποκατηγορία</Label>
            <SubdivisionDropdown
              value={currentSubdivision?.id}
              onValueChange={handleSubdivisionChange}
              subdivisions={availableSubdivisions}
              disabled={!currentSubcategory}
              placeholder='Όλες οι υποκατηγορίες'
              allLabel='Όλες οι υποκατηγορίες'
            />
          </div>
        )}

        <Separator />

        {/* Online Toggle */}
        <div className='space-y-3'>
          <Label className='text-sm font-medium'>Online</Label>
          <OnlineToggle
            id='online-sidebar'
            checked={filters.online || false}
            onCheckedChange={(checked) => handleFilterChange('online', checked)}
            label=''
          />
        </div>

        {/* County Selection */}
        <div className='space-y-3'>
          <Label className='text-sm font-medium'>Περιοχές Εξυπηρέτησης</Label>
          <CountiesDropdown
            value={filters.county}
            onValueChange={(value) =>
              handleFilterChange('county', value === '' ? undefined : value)
            }
            counties={counties}
            placeholder='Επιλέξτε περιοχή'
          />
        </div>
      </div>

      {/* Clear Button */}
      <div className='absolute bottom-0 left-0 right-0 p-6 bg-white border-t'>
        <Button
          variant='outline'
          onClick={handleClearAll}
          className='w-full'
          disabled={activeFilterCount === 0}
        >
          Καθαρισμός φίλτρων ({activeFilterCount})
        </Button>
      </div>
    </>
  );
}
