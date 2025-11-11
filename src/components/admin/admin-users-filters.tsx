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

export function AdminUsersFilters() {
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

    router.push(`/admin/users?${params.toString()}`);
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

    router.push(`/admin/users?${params.toString()}`);
  };

  return (
    <div className='flex items-center gap-4'>
      <div className='flex-1 relative'>
        <Search className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
        <Input
          placeholder='Search by email...'
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
          <SelectValue placeholder='All Types' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='all'>All Types</SelectItem>
          <SelectItem value='simple'>Simple</SelectItem>
          <SelectItem value='pro'>Pro</SelectItem>
        </SelectContent>
      </Select>
      <Select
        value={searchParams.get('provider') || 'all'}
        onValueChange={(value) => handleFilterChange('provider', value)}
      >
        <SelectTrigger className='w-40'>
          <SelectValue placeholder='All Providers' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='all'>All Providers</SelectItem>
          <SelectItem value='email'>Email</SelectItem>
          <SelectItem value='google'>Google</SelectItem>
        </SelectContent>
      </Select>
      <Select
        value={searchParams.get('step') || 'all'}
        onValueChange={(value) => handleFilterChange('step', value)}
      >
        <SelectTrigger className='w-52'>
          <SelectValue placeholder='All Steps' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='all'>All Steps</SelectItem>
          <SelectItem value='EMAIL_VERIFICATION'>Email Confirmation</SelectItem>
          <SelectItem value='OAUTH_SETUP'>OAuth Setup</SelectItem>
          <SelectItem value='ONBOARDING'>Onboarding</SelectItem>
          <SelectItem value='DASHBOARD'>Dashboard</SelectItem>
        </SelectContent>
      </Select>
      <Select
        value={searchParams.get('status') || 'all'}
        onValueChange={(value) => handleFilterChange('status', value)}
      >
        <SelectTrigger className='w-40'>
          <SelectValue placeholder='All Status' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='all'>All Status</SelectItem>
          <SelectItem value='verified'>Confirmed</SelectItem>
          <SelectItem value='unverified'>Unconfirmed</SelectItem>
          <SelectItem value='banned'>Banned</SelectItem>
          <SelectItem value='blocked'>Blocked</SelectItem>
        </SelectContent>
      </Select>
      <Select
        value={searchParams.get('role') || 'all'}
        onValueChange={(value) => handleFilterChange('role', value)}
      >
        <SelectTrigger className='w-40'>
          <SelectValue placeholder='All Roles' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='all'>All Roles</SelectItem>
          <SelectItem value='user'>User</SelectItem>
          <SelectItem value='freelancer'>Professional</SelectItem>
          <SelectItem value='company'>Company</SelectItem>
          <SelectItem value='admin'>Admin</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
