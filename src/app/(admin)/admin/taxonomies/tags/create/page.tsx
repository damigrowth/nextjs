import { TaxonomyCreatePage } from '@/components/admin';
import { CreateTagForm } from '@/components/admin/forms/create-tag-form';
import { tags } from '@/constants/datasets/tags';

export default function CreateTagPage() {
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
