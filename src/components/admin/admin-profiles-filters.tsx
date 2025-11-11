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

export function AdminProfilesFilters() {
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

    router.push(`/admin/profiles?${params.toString()}`);
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

    router.push(`/admin/profiles?${params.toString()}`);
  };

  return (
    <div className='flex items-center gap-4'>
      <div className='flex-1 relative'>
        <Search className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
        <Input
          placeholder='Search profiles...'
          defaultValue={searchParams.get('search') || ''}
          onChange={handleSearchChange}
          className='pl-9'
        />
      </div>
      <Select
        value={searchParams.get('type') || 'all'}
        onValueChange={(value) => handleFilterChange('type', value)}
      >
        <SelectTrigger className='w-40'>
          <SelectValue placeholder='Role' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='all'>All Roles</SelectItem>
          <SelectItem value='freelancer'>Professional</SelectItem>
          <SelectItem value='company'>Company</SelectItem>
        </SelectContent>
      </Select>
      <Select
        value={searchParams.get('status') || 'all'}
        onValueChange={(value) => handleFilterChange('status', value)}
      >
        <SelectTrigger className='w-40'>
          <SelectValue placeholder='Status' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='all'>All Status</SelectItem>
          <SelectItem value='featured'>Featured</SelectItem>
          <SelectItem value='top'>Top</SelectItem>
        </SelectContent>
      </Select>
      <Select
        value={searchParams.get('verified') || 'all'}
        onValueChange={(value) => handleFilterChange('verified', value)}
      >
        <SelectTrigger className='w-40'>
          <SelectValue placeholder='Verification' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='all'>All Verification</SelectItem>
          <SelectItem value='verified'>Verified</SelectItem>
          <SelectItem value='unverified'>Unverified</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
