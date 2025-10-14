import { TaxonomyCreatePage, CreateProTaxonomyForm } from '@/components/admin';
import { proTaxonomies } from '@/constants/datasets/pro-taxonomies';

export default function CreateProSubcategoryPage() {
  return (
    <TaxonomyCreatePage
      title='Create Professional Subcategory'
      backPath='/admin/taxonomies/pro/subcategories'
      backLabel='Back to Subcategories'
      description='Add a new subcategory under an existing professional category'
    >
      <CreateProTaxonomyForm level='subcategory' existingItems={proTaxonomies} />
    </TaxonomyCreatePage>
  );
}
