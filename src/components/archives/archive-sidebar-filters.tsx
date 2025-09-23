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
  const baseArchivePath = archiveType === 'services' ? '/ipiresies' :
                         archiveType === 'profiles' ? '/pros' : '/companies';

  // Get current subcategory/subdivision from path (no category level)
  const currentSubcategorySlug = pathSegments[1]; // After ipiresies/pros/companies
  const currentSubdivisionSlug = pathSegments[2];

  // Find current subcategory and subdivision from available filtered lists
  const currentSubcategory = subcategories?.find(sub => sub.slug === currentSubcategorySlug);
  const currentSubdivision = subdivisions?.find(div => div.slug === currentSubdivisionSlug);

  // Find parent category for the current subcategory (needed for some operations)
  let currentCategory = null;
  if (currentSubcategory) {
    for (const category of categories) {
      if (category.children?.some(sub => sub.id === currentSubcategory.id)) {
        currentCategory = category;
        break;
      }
    }
  }

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

  // Handle category change - now redirects to main services page
  const handleCategoryChange = (categoryId: string) => {
    if (!categoryId) {
      router.push(buildUrl(baseArchivePath));
      return;
    }

    // Since we removed categories from URLs, redirect to main page
    router.push(buildUrl(baseArchivePath));
  };

  // Handle subcategory change
  const handleSubcategoryChange = (subcategoryId: string) => {
    if (!subcategoryId) {
      router.push(buildUrl(baseArchivePath));
      return;
    }

    const subcategory = availableSubcategories.find(sub => sub.id === subcategoryId);
    if (!subcategory) return;

    const path = `${baseArchivePath}/${subcategory.slug}`;
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

  // Only count filters that represent actual user selections
  const activeFilterCount = Object.entries(filters).filter(([key, value]) => {
    // System/navigation filters - not user-applied
    const systemFilters = ['page', 'limit', 'status', 'archiveType'];
    if (systemFilters.includes(key)) {
      return false;
    }

    // Default or empty values - not active filters
    if (value === undefined || value === null || value === false ||
        value === '' || value === 'all' || value === 'default') {
      return false;
    }

    // Only count meaningful user selections
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
