import { Suspense, ComponentType, ReactNode } from 'react';
import { NextLink as Link } from '@/components/shared';
import { SiteHeader } from '@/components/admin';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw } from 'lucide-react';

export interface TaxonomyListPageConfig {
  title: string;
  createPath: string;
  createLabel: string;
  FiltersComponent: ComponentType;
  TableComponent: ComponentType<{ searchParams: any }>;
  SkeletonComponent: ComponentType;
  additionalActions?: ReactNode;
}

export interface TaxonomyListPageProps {
  config: TaxonomyListPageConfig;
  searchParams: any;
}

export function TaxonomyListPage({
  config,
  searchParams,
}: TaxonomyListPageProps) {
  return (
    <>
      <SiteHeader
        title={config.title}
        actions={
          <>
            <Button variant='outline' size='md'>
              <RefreshCw className='h-4 w-4' />
              Refresh
            </Button>
            <Button variant='default' size='md' asChild>
              <Link href={config.createPath}>
                <Plus className='h-4 w-4' />
                {config.createLabel}
              </Link>
            </Button>
            {config.additionalActions}
          </>
        }
      />
      <div className='flex flex-col gap-4 pb-6 pt-4 md:gap-6'>
        <div className='px-4 lg:px-6'>
          <div className='space-y-6'>
            <config.FiltersComponent />
            <Suspense
              key={JSON.stringify(searchParams)}
              fallback={<config.SkeletonComponent />}
            >
              <config.TableComponent searchParams={searchParams} />
            </Suspense>
          </div>
        </div>
      </div>
    </>
  );
}
