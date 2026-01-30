import { Suspense } from 'react';
import { SiteHeader } from '@/components/admin/site-header';
import { DeploymentManager } from '@/components/admin/deployment/deployment-manager';
import { DeploymentSkeleton } from '@/components/admin/deployment/deployment-skeleton';
import { getGitStatus, getRecentCommits } from '@/actions/admin/git-operations';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default async function DeployPage() {
  // Fetch data in parallel on server
  const [statusResult, commitsResult] = await Promise.all([
    getGitStatus(),
    getRecentCommits(5),
  ]);

  return (
    <>
      <SiteHeader title='Git' />
      <div className='flex flex-col gap-4 pb-6 pt-4 md:gap-6'>
        <div className='mx-auto w-full max-w-5xl px-4 lg:px-6'>
          <div className='space-y-6'>
            <Suspense fallback={<DeploymentSkeleton />}>
              <DeploymentManager
                initialStatus={statusResult.data}
                initialCommits={commitsResult.data?.commits || []}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </>
  );
}
