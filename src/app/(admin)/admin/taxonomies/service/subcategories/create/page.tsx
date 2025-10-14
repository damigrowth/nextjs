import {
  TaxonomyCreatePage,
  CreateServiceTaxonomyForm,
} from '@/components/admin';
import { serviceTaxonomies } from '@/constants/datasets/service-taxonomies';

export const dynamic = 'force-dynamic';

export default function CreateSubcategoryPage() {
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
