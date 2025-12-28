import {
  TaxonomyListPage,
  type TaxonomyListPageConfig,
} from '@/components/admin/taxonomy-list-page';
import { AdminSkillsFilters } from '@/components/admin/admin-skills-filters';
import { AdminSkillsTableSection } from '@/components/admin/admin-skills-table-section';
import { AdminSkillsTableSkeleton } from '@/components/admin/admin-skills-table-skeleton';

export const dynamic = 'force-dynamic';

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
