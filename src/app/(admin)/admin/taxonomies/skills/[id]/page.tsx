import { TaxonomyEditPage } from '@/components/admin';
import { EditSkillForm } from '@/components/admin/forms/edit-skill-form';
import { getTaxonomyWithStaging } from '@/actions/admin/get-taxonomy-with-staging';

export const dynamic = 'force-dynamic';

interface SkillDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function SkillDetailPage({
  params,
}: SkillDetailPageProps) {
  const { id } = await params;
  // Get skills and pro taxonomies including staged changes
  const skills = await getTaxonomyWithStaging('skills');
  const proTaxonomies = await getTaxonomyWithStaging('pro');

  return (
    <TaxonomyEditPage
      id={id}
      items={skills}
      entityName='Skill'
      backPath='/admin/taxonomies/skills'
      backLabel='Back to Skills'
      description='Update skill label, slug, and description'
      customFindItem={(items, id) => items.find((s) => s.id === id)}
    >
      {(skill) => (
        <EditSkillForm
          skill={skill}
          existingItems={skills}
          categories={proTaxonomies}
        />
      )}
    </TaxonomyEditPage>
  );
}
