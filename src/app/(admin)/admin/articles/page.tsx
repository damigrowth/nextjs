import { SiteHeader } from '@/components/admin/site-header';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { NextLink } from '@/components';
import { requirePermission } from '@/actions/auth/server';
import { ADMIN_RESOURCES } from '@/lib/auth/roles';
import { listArticlesAdmin } from '@/actions/blog/manage-articles';
import { AdminArticlesDataTable } from '@/components/admin/admin-articles-data-table';

export const dynamic = 'force-dynamic';

export default async function ArticlesPage() {
  await requirePermission(ADMIN_RESOURCES.BLOG, '/admin');

  const result = await listArticlesAdmin({ limit: 50 });

  const articles = result.success && result.data ? result.data.articles : [];

  return (
    <>
      <SiteHeader
        title='Άρθρα'
        actions={
          <Button variant='default' size='md' asChild>
            <NextLink href='/admin/articles/create'>
              <Plus className='h-4 w-4' />
              Νέο Άρθρο
            </NextLink>
          </Button>
        }
      />
      <div className='flex flex-col gap-4 pb-6 pt-4 md:gap-6'>
        <div className='px-4 lg:px-6'>
          {!result.success ? (
            <div className='text-destructive'>
              Σφάλμα: {result.error || 'Αποτυχία φόρτωσης άρθρων'}
            </div>
          ) : (
            <AdminArticlesDataTable data={articles} />
          )}
        </div>
      </div>
    </>
  );
}
