import {
  AdminUsersStats,
  AdminProfilesStats,
  AdminServicesStats,
  SiteHeader,
} from '@/components/admin';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Force dynamic rendering for admin pages
export const dynamic = 'force-dynamic';

export default function AnalyticsPage() {
  return (
    <>
      <SiteHeader title='Analytics' />
      <div className='flex flex-col gap-4 pb-6 pt-4 md:gap-6'>
        <div className='px-4 lg:px-6'>
          <Tabs defaultValue='overview' className='space-y-4'>
            <TabsList>
              <TabsTrigger value='overview'>Overview</TabsTrigger>
              <TabsTrigger value='users'>Users</TabsTrigger>
              <TabsTrigger value='profiles'>Profiles</TabsTrigger>
              <TabsTrigger value='services'>Services</TabsTrigger>
            </TabsList>

            <TabsContent value='overview' className='space-y-4'>
              <div className='space-y-6'>
                {/* Users Stats */}
                <div>
                  <h3 className='mb-4 text-lg font-semibold'>Users</h3>
                  <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
                    <AdminUsersStats />
                  </div>
                </div>

                {/* Profiles Stats */}
                <div>
                  <h3 className='mb-4 text-lg font-semibold'>Profiles</h3>
                  <div className='grid gap-4 md:grid-cols-3'>
                    <AdminProfilesStats />
                  </div>
                </div>

                {/* Services Stats */}
                <div>
                  <h3 className='mb-4 text-lg font-semibold'>Services</h3>
                  <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
                    <AdminServicesStats />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value='users' className='space-y-4'>
              <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
                <AdminUsersStats />
              </div>
            </TabsContent>

            <TabsContent value='profiles' className='space-y-4'>
              <div className='grid gap-4 md:grid-cols-3'>
                <AdminProfilesStats />
              </div>
            </TabsContent>

            <TabsContent value='services' className='space-y-4'>
              <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
                <AdminServicesStats />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
