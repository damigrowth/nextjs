import { Suspense } from 'react';
import { SiteHeader } from '@/components/admin/site-header';
import { DeploymentManager } from '@/components/admin/deployment/deployment-manager';
import { DeploymentSkeleton } from '@/components/admin/deployment/deployment-skeleton';

export const dynamic = 'force-dynamic';

export default async function DeployPage() {
  return (
    <>
      <SiteHeader title='Git' />
      <div className='flex flex-col gap-4 pb-6 pt-4 md:gap-6'>
        <div className='mx-auto w-full max-w-5xl px-4 lg:px-6'>
          <div className='space-y-6'>
            <Suspense fallback={<DeploymentSkeleton />}>
              <DeploymentManager />
            </Suspense>
          </div>
        </div>
      </div>
    </>
  );
}
