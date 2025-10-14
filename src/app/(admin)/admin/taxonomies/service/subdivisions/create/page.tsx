import { TaxonomyCreatePage, CreateServiceTaxonomyForm } from '@/components/admin';
import { serviceTaxonomies } from '@/constants/datasets/service-taxonomies';

export default function CreateSubdivisionPage() {
  return (
    <TaxonomyCreatePage
      title='Create Subdivision'
      backPath='/admin/taxonomies/service/subdivisions'
      backLabel='Back to Subdivisions'
      description='Add a new subdivision under an existing subcategory'
    >
      <CreateServiceTaxonomyForm level='subdivision' existingItems={serviceTaxonomies} />
    </TaxonomyCreatePage>
  );
}
