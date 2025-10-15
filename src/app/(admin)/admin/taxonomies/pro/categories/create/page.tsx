import { TaxonomyCreatePage, CreateProTaxonomyForm } from '@/components/admin';
import { getTaxonomyWithStaging } from '@/actions/admin/get-taxonomy-with-staging';

export const dynamic = 'force-dynamic';

export default async function CreateProCategoryPage() {
  // Fetch taxonomy data with staged changes applied
  const proTaxonomies = await getTaxonomyWithStaging('pro');

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
