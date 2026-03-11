import { notFound } from 'next/navigation';
import { requirePermission } from '@/actions/auth/server';
import { ADMIN_RESOURCES } from '@/lib/auth/roles';
import { getArticleAdmin } from '@/actions/blog/manage-articles';
import { listBlogCategoriesAdmin } from '@/actions/blog/manage-categories';
import { SiteHeader } from '@/components/admin/site-header';
import { ArticleForm } from '@/components/admin/article-form';

export const dynamic = 'force-dynamic';

interface EditArticlePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditArticlePage({
  params,
}: EditArticlePageProps) {
  await requirePermission(ADMIN_RESOURCES.BLOG, '/admin');

  const { id } = await params;

  const [articleResult, categoriesResult] = await Promise.all([
    getArticleAdmin(id),
    listBlogCategoriesAdmin(),
  ]);

  if (!articleResult.success || !articleResult.data) {
    notFound();
  }

  const categories =
    categoriesResult.success && categoriesResult.data
      ? categoriesResult.data
      : [];

  return (
    <>
      <SiteHeader title='Επεξεργασία Άρθρου' />
      <div className='flex flex-col gap-4 pb-6 pt-4 md:gap-6'>
        <div className='px-4 lg:px-6 max-w-4xl'>
          <ArticleForm
            article={articleResult.data}
            categories={categories}
          />
        </div>
      </div>
    </>
  );
}
