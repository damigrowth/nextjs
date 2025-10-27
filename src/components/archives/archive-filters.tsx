'use client';

import { Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SheetTrigger } from '@/components/ui/sheet';
import {
  SearchInput,
  OnlineToggle,
  CountiesDropdown,
  SortDropdown,
} from './archive-inputs';
import type { DatasetItem } from '@/lib/types/datasets';
import { cn } from '@/lib/utils';

interface ArchiveFiltersProps {
  filters: {
    search?: string;
    online?: boolean;
    county?: string;
    sortBy?: string;
    type?: 'pros' | 'companies';
  };
  onFiltersChange: (filters: any) => void;
  counties: DatasetItem[];
  className?: string;
  activeFilterCount?: number;
  filterTrigger?: React.ReactNode;
  archiveType?: 'profiles' | 'services';
  basePath?: string;
}

export function ArchiveFilters({
  filters,
  onFiltersChange,
  counties,
  className,
  activeFilterCount = 0,
  filterTrigger,
  archiveType,
  basePath,
}: ArchiveFiltersProps) {
  const handleSearchChange = (value: string) => {
    onFiltersChange({
      ...filters,
      search: value || undefined,
    });
  };

  const handleOnlineToggle = (checked: boolean) => {
    onFiltersChange({
      ...filters,
      online: checked,
    });
  };

  const handleCountyChange = (value: string) => {
    onFiltersChange({
      ...filters,
      county: value === 'all' ? undefined : value,
    });
  };

  const handleSortChange = (value: string) => {
    onFiltersChange({
      ...filters,
      sortBy: value,
    });
  };

  return (
    <div
      className={cn(
        'flex items-center bg-white border-b border-gray-200 py-4',
        className,
      )}
    >
      <div className='container mx-auto px-4'>
        <div className='flex flex-wrap items-center justify-between h-full gap-4'>
          {/* Left side: All Filters, Search, Online Toggle, Counties */}
          <div className='flex flex-wrap items-center gap-6'>
            {/* All Filters Button/Trigger */}
            {filterTrigger || (
              <SheetTrigger asChild>
                <Button
                  variant='outline'
                  className='flex items-center gap-2 relative'
                >
                  <Filter className='w-4 h-4' />
                  <span>Όλα τα φίλτρα</span>
                  {activeFilterCount > 0 && (
                    <span className='absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center text-xs font-medium'>
                      {activeFilterCount}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
            )}
            {/* Search Input */}
            <SearchInput
              value={filters.search}
              onValueChange={handleSearchChange}
              placeholder='Αναζήτηση...'
              className='min-w-56'
            />
            {/* Online Toggle */}
            <OnlineToggle
              id='online-filter'
              checked={filters.online || false}
              onCheckedChange={handleOnlineToggle}
            />

            {/* Counties Dropdown */}
            <CountiesDropdown
              value={filters.county}
              onValueChange={handleCountyChange}
              counties={counties}
            />
          </div>

          {/* Right side: Sort Dropdown */}
          <SortDropdown
            value={filters.sortBy}
            onValueChange={handleSortChange}
          />

          {/* Mobile: Only show filter button and sort */}
          <div className='flex items-center gap-2 md:hidden'>
            <SortDropdown
              value={filters.sortBy}
              onValueChange={handleSortChange}
              fullWidth={false}
              className='w-32'
              searchPlaceholder='Αναζήτηση...'
            />
          </div>
        </div>
      </div>
    </div>
  );
}
