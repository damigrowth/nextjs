import { TaxonomyCreatePage } from '@/components/admin';
import { CreateSkillForm } from '@/components/admin/forms/create-skill-form';
import { getTaxonomyWithStaging } from '@/actions/admin/get-taxonomy-with-staging';

export const dynamic = 'force-dynamic';

export default async function CreateSkillPage() {
  // Fetch taxonomy data with staged changes applied
  const skills = await getTaxonomyWithStaging('skills');
  const proTaxonomies = await getTaxonomyWithStaging('pro');

  return (
    <TaxonomyCreatePage
      title='Create Skill'
      backPath='/admin/taxonomies/skills'
      backLabel='Back to Skills'
      description='Add a new skill with label, slug, and optional category'
    >
      <CreateSkillForm existingItems={skills} categories={proTaxonomies} />
    </TaxonomyCreatePage>
  );
}
