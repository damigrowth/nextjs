import {
  TaxonomyListPage,
  type TaxonomyListPageConfig,
  AdminSkillsFilters,
  AdminSkillsTableSection,
  AdminSkillsTableSkeleton,
} from '@/components/admin';

const config: TaxonomyListPageConfig = {
  title: 'Skills',
  createPath: '/admin/taxonomies/skills/create',
  createLabel: 'Create Skill',
  FiltersComponent: AdminSkillsFilters,
  TableComponent: AdminSkillsTableSection,
  SkeletonComponent: AdminSkillsTableSkeleton,
};

interface SkillsPageProps {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    search?: string;
    category?: string;
    sortBy?: string;
    sortOrder?: string;
  }>;
}

export default async function SkillsPage({ searchParams }: SkillsPageProps) {
  const params = await searchParams;
  return <TaxonomyListPage config={config} searchParams={params} />;
}
