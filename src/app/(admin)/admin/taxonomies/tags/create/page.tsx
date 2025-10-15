import { TaxonomyCreatePage } from '@/components/admin';
import { CreateTagForm } from '@/components/admin/forms/create-tag-form';
import { getTaxonomyWithStaging } from '@/actions/admin/get-taxonomy-with-staging';

export const dynamic = 'force-dynamic';

export default async function CreateTagPage() {
  // Fetch taxonomy data with staged changes applied
  const tags = await getTaxonomyWithStaging('tags');

  return (
    <TaxonomyCreatePage
      title='Create Tag'
      backPath='/admin/taxonomies/tags'
      backLabel='Back to Tags'
      description='Add a new tag with label and slug'
    >
      <CreateTagForm existingItems={tags} />
    </TaxonomyCreatePage>
  );
}
