import { TaxonomyCreatePage, CreateServiceTaxonomyForm } from '@/components/admin';
import { serviceTaxonomies } from '@/constants/datasets/service-taxonomies';

export default function CreateCategoryPage() {
  return (
    <TaxonomyCreatePage
      title='Create Category'
      backPath='/admin/taxonomies/service/categories'
      backLabel='Back to Categories'
      description='Add a new top-level service category'
    >
      <CreateServiceTaxonomyForm level='category' existingItems={serviceTaxonomies} />
    </TaxonomyCreatePage>
  );
}
