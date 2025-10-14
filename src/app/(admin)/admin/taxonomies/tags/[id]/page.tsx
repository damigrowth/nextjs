import { TaxonomyEditPage } from '@/components/admin';
import { EditTagForm } from '@/components/admin/forms/edit-tag-form';
import { tags } from '@/constants/datasets/tags';

export const dynamic = 'force-dynamic';

interface TagDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function TagDetailPage({ params }: TagDetailPageProps) {
  const { id } = await params;

  return (
    <TaxonomyEditPage
      id={id}
      items={tags}
      entityName='Tag'
      backPath='/admin/taxonomies/tags'
      backLabel='Back to Tags'
      description='Update tag label, slug, and description'
      customFindItem={(items, id) => items.find((t) => t.id === id)}
    >
      {(tag) => <EditTagForm tag={tag} existingItems={tags} />}
    </TaxonomyEditPage>
  );
}
