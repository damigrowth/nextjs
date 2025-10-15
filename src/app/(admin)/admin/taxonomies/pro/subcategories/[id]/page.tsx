import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { SiteHeader, EditProTaxonomyForm } from '@/components/admin';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getTaxonomyWithStaging } from '@/actions/admin/get-taxonomy-with-staging';
import { findById, getItemPath } from '@/lib/utils/datasets';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProSubcategoryPage({ params }: PageProps) {
  const { id } = await params;
  // Get taxonomies including staged changes
  const proTaxonomies = await getTaxonomyWithStaging('pro');
  const taxonomy = findById(proTaxonomies, id);
  const path = getItemPath(proTaxonomies, id);

  // Subcategories have exactly 2 levels (category > subcategory)
  if (!taxonomy || path.length !== 2) {
    notFound();
  }

  const parentCategory = path[0];

  return (
    <>
      <SiteHeader
        title={`Edit Subcategory: ${taxonomy.label || ''}`}
        actions={
          <Button variant='ghost' size='sm' asChild>
            <Link href='/admin/taxonomies/pro/subcategories'>
              <ArrowLeft className='h-4 w-4' />
              Back to Subcategories
            </Link>
          </Button>
        }
      />
      <div className='mx-auto w-full max-w-5xl px-4 lg:px-6 flex flex-col gap-4 pb-16 pt-4'>
        <Card>
          <CardHeader>
            <CardTitle className='text-lg'>Edit Subcategory</CardTitle>
            <p className='text-sm text-muted-foreground'>
              Update subcategory label, slug, and description
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
                level: 'subcategory' as const,
                parentId: parentCategory.id,
                parentLabel: parentCategory.label || '',
                type: (taxonomy as any).type,
              }}
              existingItems={proTaxonomies}
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
