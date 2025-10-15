import {
  TaxonomyCreatePage,
  CreateServiceTaxonomyForm,
} from '@/components/admin';
import { getTaxonomyWithStaging } from '@/actions/admin/get-taxonomy-with-staging';

export const dynamic = 'force-dynamic';

export default async function CreateSubdivisionPage() {
  // Fetch taxonomy data with staged changes applied
  const serviceTaxonomies = await getTaxonomyWithStaging('service');

  return (
    <TaxonomyCreatePage
      title='Create Subdivision'
      backPath='/admin/taxonomies/service/subdivisions'
      backLabel='Back to Subdivisions'
      description='Add a new subdivision under an existing subcategory'
    >
      <CreateServiceTaxonomyForm
        level='subdivision'
        existingItems={serviceTaxonomies}
      />
    </TaxonomyCreatePage>
  );
}
