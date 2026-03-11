import { requireAuth } from '@/actions/auth/server';
import { getMyArticles } from '@/actions/blog/submit-article';
import { getDashboardMetadata } from '@/lib/seo/pages';
import { prisma } from '@/lib/prisma/client';
import { NextLink } from '@/components';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';

export const metadata = getDashboardMetadata('Τα Άρθρα μου');

const STATUS_MAP: Record<string, { label: string; variant: 'secondary' | 'outline' | 'default' }> = {
  draft: { label: 'Πρόχειρο', variant: 'secondary' },
  pending: { label: 'Σε αναμονή', variant: 'outline' },
  published: { label: 'Δημοσιευμένο', variant: 'default' },
};

export default async function ArticlesPage() {
  const session = await requireAuth();
  const userId = session.user.id;

  // Check subscription
  const profile = await prisma.profile.findUnique({
    where: { uid: userId },
    select: { id: true },
  });

  let hasSubscription = false;
  if (profile) {
    const subscription = await prisma.subscription.findUnique({
      where: { pid: profile.id },
      select: { plan: true, status: true },
    });
    hasSubscription =
      !!subscription &&
      subscription.plan === 'promoted' &&
      subscription.status === 'active';
  }

  if (!hasSubscription) {
    return (
      <div className='max-w-3xl w-full mx-auto space-y-6'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>Τα Άρθρα μου</h1>
          <p className='text-muted-foreground mt-1'>
            Διαχειριστείτε τα άρθρα που έχετε υποβάλει
          </p>
        </div>
        <div className='rounded-lg border p-6 text-center space-y-3'>
          <p className='text-muted-foreground'>
            Απαιτείται ενεργή συνδρομή για να υποβάλετε άρθρα στο blog.
          </p>
          <Button asChild>
            <NextLink href='/dashboard/subscription'>
              Διαχείριση Συνδρομής
            </NextLink>
          </Button>
        </div>
      </div>
    );
  }

  const result = await getMyArticles();
  const articles = result.success ? result.data || [] : [];

  return (
    <div className='max-w-3xl w-full mx-auto space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>Τα Άρθρα μου</h1>
          <p className='text-muted-foreground mt-1'>
            Διαχειριστείτε τα άρθρα που έχετε υποβάλει
          </p>
        </div>
        <Button asChild>
          <NextLink href='/dashboard/articles/create'>
            <Plus className='h-4 w-4 mr-2' />
            Νέο Άρθρο
          </NextLink>
        </Button>
      </div>

      {articles.length === 0 ? (
        <div className='rounded-lg border p-6 text-center'>
          <p className='text-muted-foreground'>
            Δεν έχετε υποβάλει κανένα άρθρο ακόμα.
          </p>
        </div>
      ) : (
        <div className='rounded-lg border divide-y'>
          {articles.map((article: any) => {
            const statusInfo = STATUS_MAP[article.status] || STATUS_MAP.draft;
            return (
              <div
                key={article.id}
                className='flex items-center justify-between p-4'
              >
                <div className='space-y-1 min-w-0 flex-1'>
                  <div className='flex items-center gap-2'>
                    <span className='font-medium truncate'>
                      {article.title}
                    </span>
                    <Badge variant={statusInfo.variant}>
                      {statusInfo.label}
                    </Badge>
                  </div>
                  <div className='text-sm text-muted-foreground flex items-center gap-2'>
                    {article.category?.label && (
                      <span>{article.category.label}</span>
                    )}
                    <span>
                      {new Date(article.createdAt).toLocaleDateString('el-GR')}
                    </span>
                  </div>
                </div>
                {article.status !== 'published' && (
                  <Button variant='outline' size='sm' asChild>
                    <NextLink href={`/dashboard/articles/${article.id}`}>
                      Επεξεργασία
                    </NextLink>
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
