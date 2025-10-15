import {
  TaxonomyCreatePage,
  CreateServiceTaxonomyForm,
} from '@/components/admin';
import { getTaxonomyWithStaging } from '@/actions/admin/get-taxonomy-with-staging';

export const dynamic = 'force-dynamic';

export default async function CreateSubcategoryPage() {
  // Fetch taxonomy data with staged changes applied
  const serviceTaxonomies = await getTaxonomyWithStaging('service');

  return (
    <TaxonomyCreatePage
      title='Create Subcategory'
      backPath='/admin/taxonomies/service/subcategories'
      backLabel='Back to Subcategories'
      description='Add a new subcategory under an existing category'
    >
      <CreateServiceTaxonomyForm
        level='subcategory'
        existingItems={serviceTaxonomies}
      />
    </TaxonomyCreatePage>
  );
}
