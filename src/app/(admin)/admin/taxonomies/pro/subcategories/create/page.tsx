import { TaxonomyCreatePage } from '@/components/admin/taxonomy-create-page';
import { CreateProTaxonomyForm } from '@/components/admin/forms/create-pro-taxonomy-form';
import { getTaxonomyWithStaging } from '@/actions/admin/get-taxonomy-with-staging';

export const dynamic = 'force-dynamic';

export default async function CreateProSubcategoryPage() {
  // Fetch taxonomy data with staged changes applied
  const proTaxonomies = await getTaxonomyWithStaging('pro');

  return (
    <TaxonomyCreatePage
      title='Create Professional Subcategory'
      backPath='/admin/taxonomies/pro/subcategories'
      backLabel='Back to Subcategories'
      description='Add a new subcategory under an existing professional category'
    >
      <CreateProTaxonomyForm
        level='subcategory'
        existingItems={proTaxonomies}
      />
    </TaxonomyCreatePage>
  );
}
