import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SiteHeader } from '@/components/admin';
import { EditTaxonomyItemForm } from '@/components/admin/forms';
import { serviceTaxonomies } from '@/constants/datasets/service-taxonomies';
import { findById, getItemPath } from '@/lib/utils/datasets';
import { DatasetItem } from '@/lib/types/datasets';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditSubdivisionPage({ params }: PageProps) {
  const { id } = await params;
  const taxonomy = findById(serviceTaxonomies as DatasetItem[], id);
  const path = getItemPath(serviceTaxonomies as DatasetItem[], id);

  // Subdivisions have exactly 3 levels (category > subcategory > subdivision)
  if (!taxonomy || path.length !== 3) {
    notFound();
  }

  const category = path[0];
  const parentSubcategory = path[1];

  return (
    <>
      <SiteHeader
        title={`Edit Subdivision: ${taxonomy.label || ''}`}
        actions={
          <Button variant='ghost' size='sm' asChild>
            <Link href='/admin/taxonomies/service/subdivisions'>
              <ArrowLeft className='h-4 w-4' />
              Back to Subdivisions
            </Link>
          </Button>
        }
      />
      <div className='mx-auto w-full max-w-5xl px-4 lg:px-6 flex flex-col gap-4 pb-16 pt-4'>
        <Card>
          <CardHeader>
            <CardTitle className='text-lg'>Edit Subdivision</CardTitle>
            <p className='text-sm text-muted-foreground'>
              Update subdivision label, slug, and description
            </p>
          </CardHeader>
          <CardContent>
            <EditTaxonomyItemForm
              taxonomy={{
                id: taxonomy.id,
                label: taxonomy.label || '',
                slug: taxonomy.slug || '',
                description: taxonomy.description || '',
                level: 'subdivision' as const,
                parentId: parentSubcategory.id,
                parentLabel: `${category.label || ''} > ${parentSubcategory.label || ''}`,
                image: taxonomy.image,
              }}
              existingItems={serviceTaxonomies}
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
