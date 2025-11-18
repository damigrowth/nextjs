import { Suspense } from 'react';
import { SiteHeader } from '@/components/admin';
import { Button } from '@/components/ui/button';
import { ArrowLeft, GitBranch } from 'lucide-react';
import { NextLink as Link } from '@/components/shared';
import { DeploymentManager } from '@/components/admin/deployment/deployment-manager';
import { DeploymentSkeleton } from '@/components/admin/deployment/deployment-skeleton';

export const dynamic = 'force-dynamic';

export default async function TaxonomyDeployPage() {
  return (
    <>
      <SiteHeader
        title='Deploy Taxonomy Changes'
        actions={
          <Button variant='ghost' size='sm' asChild>
            <Link href='/admin/taxonomies/service'>
              <ArrowLeft className='h-4 w-4' />
              Back to Taxonomies
            </Link>
          </Button>
        }
      />
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
