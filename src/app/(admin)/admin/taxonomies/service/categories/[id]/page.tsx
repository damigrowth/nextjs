import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SiteHeader } from '@/components/admin';
import { EditTaxonomyItemForm } from '@/components/admin/forms';
import { serviceTaxonomies } from '@/constants/datasets/service-taxonomies';
import { findById } from '@/lib/utils/datasets';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCategoryPage({ params }: PageProps) {
  const { id } = await params;
  const taxonomy = findById(serviceTaxonomies, id);

  // Verify it's a top-level category
  if (!taxonomy || !serviceTaxonomies.some((cat) => cat.id === id)) {
    notFound();
  }

  return (
    <>
      <SiteHeader
        title={`Edit Category: ${taxonomy.label || ''}`}
        actions={
          <Button variant='ghost' size='sm' asChild>
            <Link href='/admin/taxonomies/service/categories'>
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
              Update category label, slug, description, and metadata
            </p>
          </CardHeader>
          <CardContent>
            <EditTaxonomyItemForm
              taxonomy={{
                id: taxonomy.id,
                label: taxonomy.label || '',
                slug: taxonomy.slug || '',
                description: taxonomy.description || '',
                level: 'category' as const,
                featured: taxonomy.featured,
                icon: taxonomy.icon,
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
