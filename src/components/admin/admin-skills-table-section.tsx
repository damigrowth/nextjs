import { getTaxonomyWithStaging } from '@/actions/admin/get-taxonomy-with-staging';
import { AdminSkillsDataTable } from './admin-skills-data-table';
import {
  processTableData,
  TableSectionWrapper,
  standardSearchFilter,
  standardSortFn,
  combineFilters,
  BaseSearchParams,
} from './utils/table-section-utils';

interface AdminSkillsTableSectionProps {
  searchParams: BaseSearchParams;
  categoryLookup?: Record<string, string>;
}

export async function AdminSkillsTableSection({
  searchParams,
  categoryLookup,
}: AdminSkillsTableSectionProps) {
  // Get skills including staged changes
  const skills = await getTaxonomyWithStaging('skills');

  const categoryFilter = (skill: any, params: BaseSearchParams) => {
    const { category } = params;
    if (!category || category === 'all') return true;
    if (category === 'none') return !skill.category;
    return skill.category === category;
  };

  const { paginatedData, totalPages, currentPage, currentLimit } =
    processTableData({
      data: skills,
      searchParams,
      basePath: '/admin/taxonomies/skills',
      filterFn: combineFilters(standardSearchFilter, categoryFilter),
      sortFn: standardSortFn,
    });

  return (
    <TableSectionWrapper
      totalPages={totalPages}
      currentPage={currentPage}
      currentLimit={currentLimit}
      basePath='/admin/taxonomies/skills'
    >
      <AdminSkillsDataTable
        data={paginatedData}
        categoryLookup={categoryLookup}
      />
    </TableSectionWrapper>
  );
}
