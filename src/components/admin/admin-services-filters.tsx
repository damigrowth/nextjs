'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function AdminServicesFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value && value !== 'all') {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    // Reset to page 1 when filters change
    params.set('page', '1');

    router.push(`/admin/services?${params.toString()}`);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const params = new URLSearchParams(searchParams.toString());

    if (e.target.value) {
      params.set('search', e.target.value);
    } else {
      params.delete('search');
    }

    // Reset to page 1 when search changes
    params.set('page', '1');

    router.push(`/admin/services?${params.toString()}`);
  };

  return (
    <div className='flex items-center gap-4'>
      <div className='flex-1 relative'>
        <Search className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
        <Input
          placeholder='Αναζήτηση υπηρεσιών...'
          defaultValue={searchParams.get('search') || ''}
          onChange={handleSearchChange}
          className='pl-9'
        />
      </div>

      {/* Status Filter */}
      <Select
        value={searchParams.get('status') || 'all'}
        onValueChange={(value) => handleFilterChange('status', value)}
      >
        <SelectTrigger className='w-40'>
          <SelectValue placeholder='All Status' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='all'>All Status</SelectItem>
          <SelectItem value='published'>Published</SelectItem>
          <SelectItem value='approved'>Approved</SelectItem>
          <SelectItem value='pending'>Pending</SelectItem>
          <SelectItem value='draft'>Draft</SelectItem>
          <SelectItem value='rejected'>Rejected</SelectItem>
          <SelectItem value='inactive'>Inactive</SelectItem>
        </SelectContent>
      </Select>

      {/* Type Filter - Presence/Online */}
      <Select
        value={searchParams.get('type') || 'all'}
        onValueChange={(value) => handleFilterChange('type', value)}
      >
        <SelectTrigger className='w-40'>
          <SelectValue placeholder='All Types' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='all'>All Types</SelectItem>
          <SelectItem value='presence'>Presence</SelectItem>
          <SelectItem value='onbase'>On-base</SelectItem>
          <SelectItem value='onsite'>On-site</SelectItem>
          <SelectItem value='online'>Online</SelectItem>
          <SelectItem value='oneoff'>One-off</SelectItem>
          <SelectItem value='subscription'>Subscription</SelectItem>
        </SelectContent>
      </Select>

      {/* Pricing - Fixed/Not Fixed */}
      <Select
        value={searchParams.get('pricing') || 'all'}
        onValueChange={(value) => handleFilterChange('pricing', value)}
      >
        <SelectTrigger className='w-40'>
          <SelectValue placeholder='All Pricing' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='all'>All Pricing</SelectItem>
          <SelectItem value='fixed'>Fixed</SelectItem>
          <SelectItem value='not-fixed'>Not Fixed</SelectItem>
        </SelectContent>
      </Select>

      {/* Subscription Type Filter */}
      <Select
        value={searchParams.get('subscriptionType') || 'all'}
        onValueChange={(value) => handleFilterChange('subscriptionType', value)}
      >
        <SelectTrigger className='w-44'>
          <SelectValue placeholder='All Subscriptions' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='all'>All Subscriptions</SelectItem>
          <SelectItem value='month'>Month</SelectItem>
          <SelectItem value='year'>Year</SelectItem>
          <SelectItem value='per_case'>Per Case</SelectItem>
          <SelectItem value='per_hour'>Per Hour</SelectItem>
          <SelectItem value='per_session'>Per Session</SelectItem>
        </SelectContent>
      </Select>

      {/* Featured Filter */}
      <Select
        value={searchParams.get('featured') || 'all'}
        onValueChange={(value) => handleFilterChange('featured', value)}
      >
        <SelectTrigger className='w-40'>
          <SelectValue placeholder='All Featured' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='all'>All Featured</SelectItem>
          <SelectItem value='featured'>Featured</SelectItem>
          <SelectItem value='not-featured'>Not Featured</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
