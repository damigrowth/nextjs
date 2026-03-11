import { SiteHeader } from '@/components/admin/site-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';
import { NextLink } from '@/components';
import { requirePermission } from '@/actions/auth/server';
import { ADMIN_RESOURCES } from '@/lib/auth/roles';
import { listArticlesAdmin } from '@/actions/blog/manage-articles';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export const dynamic = 'force-dynamic';

const statusLabels: Record<string, string> = {
  draft: 'Πρόχειρο',
  pending: 'Σε αναμονή',
  published: 'Δημοσιευμένο',
};

const statusVariants: Record<string, 'default' | 'secondary' | 'outline'> = {
  draft: 'secondary',
  pending: 'outline',
  published: 'default',
};

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
            <div className='rounded-md border'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Τίτλος</TableHead>
                    <TableHead>Κατηγορία</TableHead>
                    <TableHead>Συγγραφείς</TableHead>
                    <TableHead>Κατάσταση</TableHead>
                    <TableHead>Ημ/νία Δημοσίευσης</TableHead>
                    <TableHead className='text-right'>Ενέργειες</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {articles.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className='h-24 text-center'>
                        <div className='text-muted-foreground'>
                          Δεν βρέθηκαν άρθρα.
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    articles.map((article: any) => (
                      <TableRow key={article.id}>
                        <TableCell className='font-medium max-w-[300px] truncate'>
                          {article.title}
                        </TableCell>
                        <TableCell>
                          {article.category?.label || '-'}
                        </TableCell>
                        <TableCell>
                          {article.authors
                            ?.map(
                              (a: any) =>
                                a.profile?.displayName || a.profile?.username,
                            )
                            .filter(Boolean)
                            .join(', ') || '-'}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              statusVariants[article.status] || 'secondary'
                            }
                          >
                            {statusLabels[article.status] || article.status}
                          </Badge>
                          {article.featured && (
                            <Badge variant='outline' className='ml-1'>
                              Featured
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {article.publishedAt
                            ? new Date(article.publishedAt).toLocaleDateString(
                                'el-GR',
                              )
                            : '-'}
                        </TableCell>
                        <TableCell className='text-right'>
                          <Button variant='ghost' size='sm' asChild>
                            <NextLink
                              href={`/admin/articles/${article.id}`}
                            >
                              Επεξεργασία
                            </NextLink>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
