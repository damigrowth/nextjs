import { requirePermission } from '@/actions/auth/server';
import { ADMIN_RESOURCES } from '@/lib/auth/roles';
import { listBlogCategoriesAdmin } from '@/actions/blog/manage-categories';
import { SiteHeader } from '@/components/admin/site-header';
import { BlogCategoriesManager } from '@/components/admin/blog-categories-manager';

export const dynamic = 'force-dynamic';

export default async function BlogCategoriesPage() {
  await requirePermission(ADMIN_RESOURCES.BLOG, '/admin');

  const result = await listBlogCategoriesAdmin();
  const categories = result.success && result.data ? result.data : [];

  return (
    <>
      <SiteHeader title='Κατηγορίες Blog' />
      <div className='flex flex-col gap-4 pb-6 pt-4 md:gap-6'>
        <div className='px-4 lg:px-6 max-w-3xl'>
          {!result.success ? (
            <div className='text-destructive'>
              Σφάλμα: {result.error || 'Αποτυχία φόρτωσης κατηγοριών'}
            </div>
          ) : (
            <BlogCategoriesManager initialCategories={categories} />
          )}
        </div>
      </div>
    </>
  );
}
