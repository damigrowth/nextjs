import { TaxonomyCreatePage } from '@/components/admin';
import { CreateSkillForm } from '@/components/admin/forms/create-skill-form';
import { skills } from '@/constants/datasets/skills';
import { proTaxonomies } from '@/constants/datasets/pro-taxonomies';

export default function CreateSkillPage() {
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
