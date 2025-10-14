import { TaxonomyCreatePage, CreateProTaxonomyForm } from '@/components/admin';
import { proTaxonomies } from '@/constants/datasets/pro-taxonomies';

export default function CreateProCategoryPage() {
  return (
    <TaxonomyCreatePage
      title='Create Professional Category'
      backPath='/admin/taxonomies/pro/categories'
      backLabel='Back to Categories'
      description='Add a new top-level professional category'
    >
      <CreateProTaxonomyForm level='category' existingItems={proTaxonomies} />
    </TaxonomyCreatePage>
  );
}
