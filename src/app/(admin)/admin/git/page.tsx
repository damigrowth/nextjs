import { SiteHeader } from '@/components/admin/site-header';
import { DraftPublishCard } from '@/components/admin/draft-publish-card';
import { getAdminSessionWithPermission } from '@/actions/admin/helpers';
import { ADMIN_RESOURCES } from '@/lib/auth/roles';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default async function DeployPage() {
  // Auth check for page access
  await getAdminSessionWithPermission(ADMIN_RESOURCES.GIT, 'view');

  return (
    <>
      <SiteHeader title='Git' />
      <div className='flex flex-col gap-4 pb-6 pt-4 md:gap-6'>
        <div className='mx-auto w-full max-w-5xl px-4 lg:px-6'>
          <DraftPublishCard />
        </div>
      </div>
    </>
  );
}
