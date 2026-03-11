import { notFound, redirect } from 'next/navigation';
import { requireAuth } from '@/actions/auth/server';
import { getBlogCategories } from '@/actions/blog/get-articles';
import { getDashboardMetadata } from '@/lib/seo/pages';
import { prisma } from '@/lib/prisma/client';
import { SubmitArticleForm } from '@/components/dashboard/submit-article-form';

export const metadata = getDashboardMetadata('Επεξεργασία Άρθρου');

interface EditArticlePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditArticlePage({ params }: EditArticlePageProps) {
  const { id } = await params;
  const session = await requireAuth();
  const userId = session.user.id;

  // Get user's profile
  const profile = await prisma.profile.findUnique({
    where: { uid: userId },
    select: { id: true },
  });

  if (!profile) {
    redirect('/dashboard/articles');
  }

  // Get article with ownership check
  const article = await prisma.blogArticle.findUnique({
    where: { id },
    include: {
      category: { select: { id: true, label: true } },
      authors: {
        select: { profileId: true },
      },
    },
  });

  if (!article) {
    notFound();
  }

  // Verify ownership
  const isAuthor = article.authors.some((a) => a.profileId === profile.id);
  if (!isAuthor) {
    redirect('/dashboard/articles');
  }

  // Only allow editing draft/pending articles
  if (article.status === 'published') {
    redirect('/dashboard/articles');
  }

  const categoriesResult = await getBlogCategories();
  const categories = categoriesResult.success ? categoriesResult.data || [] : [];

  return (
    <div className='max-w-3xl w-full mx-auto space-y-6'>
      <div>
        <h1 className='text-2xl font-bold tracking-tight'>
          Επεξεργασία Άρθρου
        </h1>
        <p className='text-muted-foreground mt-1'>
          Ενημερώστε το άρθρο σας πριν την αξιολόγηση
        </p>
      </div>
      <SubmitArticleForm article={article} categories={categories} />
    </div>
  );
}
