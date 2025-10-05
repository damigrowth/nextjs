'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { proTaxonomies } from '@/constants/datasets/pro-taxonomies';

interface AdminServiceFilterOptions {
  search?: string;
  status?: string;
  featured?: string;
  category?: string;
}

interface AdminServiceTableFiltersProps {
  currentFilters: AdminServiceFilterOptions;
  className?: string;
}

export default function AdminServiceTableFilters({
  currentFilters,
  className,
}: AdminServiceTableFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilters = (newParams: Partial<AdminServiceFilterOptions>) => {
    const params = new URLSearchParams(searchParams);

    // Update each parameter
    Object.entries(newParams).forEach(([key, value]) => {
      if (value && value !== 'all' && value !== '') {
        params.set(key, value.toString());
      } else {
        params.delete(key);
      }
    });

    // Always reset to page 1 when filters change
    params.set('page', '1');

    router.push(`/admin/services?${params.toString()}`);
  };

  const handleSearchChange = (search: string) => {
    updateFilters({ search });
  };

  const handleStatusChange = (status: string) => {
    updateFilters({ status });
  };

  const handleFeaturedChange = (featured: string) => {
    updateFilters({ featured });
  };

  const handleCategoryChange = (category: string) => {
    updateFilters({ category });
  };

  const handleClearFilters = () => {
    router.push('/admin/services');
  };

  // Count active filters
  const getActiveFiltersCount = () => {
    let count = 0;
    if (currentFilters.search && currentFilters.search.trim()) count++;
    if (currentFilters.status && currentFilters.status !== 'all') count++;
    if (currentFilters.featured && currentFilters.featured !== 'all') count++;
    if (currentFilters.category && currentFilters.category !== 'all') count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  // Get unique categories from pro taxonomies
  const categories = Object.keys(proTaxonomies);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Main Filter Bar */}
      <div className='flex flex-col sm:flex-row gap-4'>
        {/* Search Input */}
        <div className='relative flex-1'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
          <Input
            placeholder='Search services...'
            defaultValue={currentFilters.search || ''}
            onChange={(e) => {
              // Debounce search input
              const timeoutId = setTimeout(() => {
                handleSearchChange(e.target.value);
              }, 500);

              return () => clearTimeout(timeoutId);
            }}
            className='pl-10'
          />
        </div>

        {/* Status Filter */}
        <Select
          value={currentFilters.status || 'all'}
          onValueChange={handleStatusChange}
        >
          <SelectTrigger className='w-full sm:w-[180px]'>
            <SelectValue placeholder='Status' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Status</SelectItem>
            <SelectItem value='draft'>Draft</SelectItem>
            <SelectItem value='pending'>Pending</SelectItem>
            <SelectItem value='published'>Published</SelectItem>
            <SelectItem value='approved'>Approved</SelectItem>
            <SelectItem value='rejected'>Rejected</SelectItem>
            <SelectItem value='inactive'>Inactive</SelectItem>
          </SelectContent>
        </Select>

        {/* Featured Filter */}
        <Select
          value={currentFilters.featured || 'all'}
          onValueChange={handleFeaturedChange}
        >
          <SelectTrigger className='w-full sm:w-[180px]'>
            <SelectValue placeholder='Featured' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Services</SelectItem>
            <SelectItem value='featured'>Featured Only</SelectItem>
            <SelectItem value='not-featured'>Not Featured</SelectItem>
          </SelectContent>
        </Select>

        {/* Category Filter */}
        <Select
          value={currentFilters.category || 'all'}
          onValueChange={handleCategoryChange}
        >
          <SelectTrigger className='w-full sm:w-[180px]'>
            <SelectValue placeholder='Category' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Clear Filters Button */}
        {activeFiltersCount > 0 && (
          <Button
            variant='outline'
            onClick={handleClearFilters}
            className='w-full sm:w-auto'
          >
            <X className='w-4 h-4 mr-2' />
            Clear
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className='flex items-center gap-2 flex-wrap'>
          <Filter className='w-4 h-4 text-gray-500' />
          <span className='text-sm text-gray-600'>Active filters:</span>

          {currentFilters.search && currentFilters.search.trim() && (
            <Badge variant='secondary' className='gap-1'>
              Search: &quot;{currentFilters.search}&quot;
              <button
                onClick={() => handleSearchChange('')}
                className='ml-1 hover:text-red-600'
              >
                <X className='w-3 h-3' />
              </button>
            </Badge>
          )}

          {currentFilters.status && currentFilters.status !== 'all' && (
            <Badge variant='secondary' className='gap-1'>
              Status: {getStatusLabel(currentFilters.status)}
              <button
                onClick={() => handleStatusChange('all')}
                className='ml-1 hover:text-red-600'
              >
                <X className='w-3 h-3' />
              </button>
            </Badge>
          )}

          {currentFilters.featured && currentFilters.featured !== 'all' && (
            <Badge variant='secondary' className='gap-1'>
              Featured: {getFeaturedLabel(currentFilters.featured)}
              <button
                onClick={() => handleFeaturedChange('all')}
                className='ml-1 hover:text-red-600'
              >
                <X className='w-3 h-3' />
              </button>
            </Badge>
          )}

          {currentFilters.category && currentFilters.category !== 'all' && (
            <Badge variant='secondary' className='gap-1'>
              Category: {currentFilters.category}
              <button
                onClick={() => handleCategoryChange('all')}
                className='ml-1 hover:text-red-600'
              >
                <X className='w-3 h-3' />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}

// Helper function to get status label
function getStatusLabel(status: string): string {
  switch (status) {
    case 'draft':
      return 'Draft';
    case 'pending':
      return 'Pending';
    case 'published':
      return 'Published';
    case 'approved':
      return 'Approved';
    case 'rejected':
      return 'Rejected';
    case 'inactive':
      return 'Inactive';
    default:
      return status;
  }
}

// Helper function to get featured label
function getFeaturedLabel(featured: string): string {
  switch (featured) {
    case 'featured':
      return 'Featured Only';
    case 'not-featured':
      return 'Not Featured';
    default:
      return featured;
  }
}
