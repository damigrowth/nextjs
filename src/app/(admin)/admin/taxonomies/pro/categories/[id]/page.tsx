import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { SiteHeader, EditProTaxonomyForm } from '@/components/admin';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getTaxonomyWithStaging } from '@/actions/admin/get-taxonomy-with-staging';
import { findById } from '@/lib/utils/datasets';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProCategoryPage({ params }: PageProps) {
  const { id } = await params;
  // Get taxonomies including staged changes
  const proTaxonomies = await getTaxonomyWithStaging('pro');
  const taxonomy = findById(proTaxonomies, id);

  // Verify it's a top-level category
  if (!taxonomy || !proTaxonomies.some((cat) => cat.id === id)) {
    notFound();
  }

  return (
    <>
      <SiteHeader
        title={`Edit Category: ${taxonomy.label || ''}`}
        actions={
          <Button variant='ghost' size='sm' asChild>
            <Link href='/admin/taxonomies/pro/categories'>
              <ArrowLeft className='h-4 w-4' />
              Back to Categories
            </Link>
          </Button>
        }
      />
      <div className='mx-auto w-full max-w-5xl px-4 lg:px-6 flex flex-col gap-4 pb-16 pt-4'>
        <Card>
          <CardHeader>
            <CardTitle className='text-lg'>Edit Category</CardTitle>
            <p className='text-sm text-muted-foreground'>
              Update category label, slug, and description
            </p>
          </CardHeader>
          <CardContent>
            <EditProTaxonomyForm
              taxonomy={{
                id: taxonomy.id,
                label: taxonomy.label || '',
                slug: taxonomy.slug || '',
                plural: taxonomy.plural || '',
                description: taxonomy.description || '',
                level: 'category' as const,
              }}
              existingItems={proTaxonomies}
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
