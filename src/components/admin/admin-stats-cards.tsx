import { BriefcaseIcon, CheckCircleIcon, UsersIcon } from 'lucide-react';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface ServiceStats {
  total: number;
  published: number;
  pending: number;
}

interface ProfileStats {
  total: number;
  verified: number;
  unverified: number;
}

interface UserStats {
  total: number;
  byType: {
    simple: number;
    pro: number;
  };
}

interface AdminStatsCardsProps {
  serviceStats: ServiceStats | null;
  profileStats: ProfileStats | null;
  userStats: UserStats | null;
}

export function AdminStatsCards({
  serviceStats,
  profileStats,
  userStats,
}: AdminStatsCardsProps) {
  return (
    <div className='grid gap-4 px-4 md:grid-cols-3 lg:px-6'>
      {/* Services Card */}
      {serviceStats && (
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Total Services
            </CardTitle>
            <BriefcaseIcon className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{serviceStats.total}</div>
            <div className='mt-4 space-y-1 text-xs text-muted-foreground'>
              <div className='flex items-center justify-between'>
                <span>Published</span>
                <span className='font-medium text-foreground'>
                  {serviceStats.published}
                </span>
              </div>
              <div className='flex items-center justify-between'>
                <span>Pending</span>
                <span className='font-medium text-foreground'>
                  {serviceStats.pending}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Verifications Card */}
      {profileStats && (
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Verifications
            </CardTitle>
            <CheckCircleIcon className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{profileStats.total}</div>
            <div className='mt-4 space-y-1 text-xs text-muted-foreground'>
              <div className='flex items-center justify-between'>
                <span>Verified</span>
                <span className='font-medium text-foreground'>
                  {profileStats.verified}
                </span>
              </div>
              <div className='flex items-center justify-between'>
                <span>Pending</span>
                <span className='font-medium text-foreground'>
                  {profileStats.unverified}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Users Card */}
      {userStats && (
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Users</CardTitle>
            <UsersIcon className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{userStats.total}</div>
            <div className='mt-4 space-y-1 text-xs text-muted-foreground'>
              <div className='flex items-center justify-between'>
                <span>User</span>
                <span className='font-medium text-foreground'>
                  {userStats.byType.simple}
                </span>
              </div>
              <div className='flex items-center justify-between'>
                <span>Pro</span>
                <span className='font-medium text-foreground'>
                  {userStats.byType.pro}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
