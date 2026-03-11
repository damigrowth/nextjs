import { requirePermission } from '@/actions/auth/server';
import { ADMIN_RESOURCES } from '@/lib/auth/roles';
import { listBlogCategoriesAdmin } from '@/actions/blog/manage-categories';
import { SiteHeader } from '@/components/admin/site-header';
import { ArticleForm } from '@/components/admin/article-form';

export const dynamic = 'force-dynamic';

export default async function CreateArticlePage() {
  await requirePermission(ADMIN_RESOURCES.BLOG, '/admin');

  const categoriesResult = await listBlogCategoriesAdmin();
  const categories =
    categoriesResult.success && categoriesResult.data
      ? categoriesResult.data
      : [];

  return (
    <>
      <SiteHeader title='Νέο Άρθρο' />
      <div className='flex flex-col gap-4 pb-6 pt-4 md:gap-6'>
        <div className='px-4 lg:px-6 max-w-4xl'>
          <ArticleForm categories={categories} />
        </div>
      </div>
    </>
  );
}
