import { requireAuth } from '@/actions/auth/server';
import { getBlogCategories } from '@/actions/blog/get-articles';
import { getDashboardMetadata } from '@/lib/seo/pages';
import { SubmitArticleForm } from '@/components/dashboard/submit-article-form';

export const metadata = getDashboardMetadata('Νέο Άρθρο');

export default async function CreateArticlePage() {
  await requireAuth();

  const categoriesResult = await getBlogCategories();
  const categories = categoriesResult.success ? categoriesResult.data || [] : [];

  return (
    <div className='max-w-3xl w-full mx-auto space-y-6'>
      <div>
        <h1 className='text-2xl font-bold tracking-tight'>Νέο Άρθρο</h1>
        <p className='text-muted-foreground mt-1'>
          Υποβάλετε ένα νέο άρθρο για δημοσίευση
        </p>
      </div>
      <SubmitArticleForm categories={categories} />
    </div>
  );
}
