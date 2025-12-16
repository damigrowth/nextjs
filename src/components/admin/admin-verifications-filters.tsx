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

export function AdminVerificationsFilters() {
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

    router.push(`/admin/verifications?${params.toString()}`);
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

    router.push(`/admin/verifications?${params.toString()}`);
  };

  return (
    <div className='flex items-center gap-4'>
      <div className='flex-1 relative'>
        <Search className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
        <Input
          placeholder='Αναζήτηση με ΑΦΜ ή επωνυμία...'
          defaultValue={searchParams.get('search') || ''}
          onChange={handleSearchChange}
          className='pl-9'
        />
      </div>
      <Select
        value={searchParams.get('status') || 'all'}
        onValueChange={(value) => handleFilterChange('status', value)}
      >
        <SelectTrigger className='w-40'>
          <SelectValue placeholder='Status' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='all'>All Status</SelectItem>
          <SelectItem value='PENDING'>Pending</SelectItem>
          <SelectItem value='APPROVED'>Approved</SelectItem>
          <SelectItem value='REJECTED'>Rejected</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
