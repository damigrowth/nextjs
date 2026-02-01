import { Suspense } from 'react';
import { SiteHeader } from '@/components/admin/site-header';
import { DeploymentManager } from '@/components/admin/deployment/deployment-manager';
import { DeploymentSkeleton } from '@/components/admin/deployment/deployment-skeleton';
import { DraftPublishCard } from '@/components/admin/draft-publish-card';
import { getGitStatus, getRecentCommits } from '@/actions/admin/git-operations';
import { getAdminSessionWithPermission } from '@/actions/admin/helpers';
import { ADMIN_RESOURCES } from '@/lib/auth/roles';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default async function DeployPage() {
  console.log('[GIT_PAGE] START:', new Date().toISOString());

  // Single auth check for entire page - eliminates 2 redundant 60-73s auth calls
  const authStart = performance.now();
  const session = await getAdminSessionWithPermission(ADMIN_RESOURCES.GIT, 'view');
  console.log('[GIT_PAGE] Auth check took:', performance.now() - authStart, 'ms');

  // Pass session to actions to skip internal auth checks (ML15-290 performance fix)
  const fetchStart = performance.now();
  const [statusResult, commitsResult] = await Promise.all([
    getGitStatus(session),
    getRecentCommits(5, undefined, session),
  ]);
  console.log('[GIT_PAGE] Parallel fetch took:', performance.now() - fetchStart, 'ms');
  console.log('[GIT_PAGE] END:', new Date().toISOString());

  return (
    <>
      <SiteHeader title='Git' />
      <div className='flex flex-col gap-4 pb-6 pt-4 md:gap-6'>
        <div className='mx-auto w-full max-w-5xl px-4 lg:px-6'>
          <div className='space-y-6'>
            {/* Taxonomy Drafts - Publish pending changes */}
            <DraftPublishCard />

            {/* Git Operations - Manual deployments */}
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
