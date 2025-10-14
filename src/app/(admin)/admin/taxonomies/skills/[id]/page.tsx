import { TaxonomyEditPage } from '@/components/admin';
import { EditSkillForm } from '@/components/admin/forms/edit-skill-form';
import { skills } from '@/constants/datasets/skills';
import { proTaxonomies } from '@/constants/datasets/pro-taxonomies';

interface SkillDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function SkillDetailPage({ params }: SkillDetailPageProps) {
  const { id } = await params;

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
      {(skill) => <EditSkillForm skill={skill} existingItems={skills} categories={proTaxonomies} />}
    </TaxonomyEditPage>
  );
}
