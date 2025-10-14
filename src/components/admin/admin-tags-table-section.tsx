import { tags } from '@/constants/datasets/tags';
import { AdminTagsDataTable } from './admin-tags-data-table';
import {
  processTableData,
  TableSectionWrapper,
  standardSearchFilter,
  standardSortFn,
  BaseSearchParams,
} from './utils/table-section-utils';

interface AdminTagsTableSectionProps {
  searchParams: BaseSearchParams;
}

export async function AdminTagsTableSection({ searchParams }: AdminTagsTableSectionProps) {
  const { paginatedData, totalPages, currentPage, currentLimit } = processTableData({
    data: tags,
    searchParams,
    basePath: '/admin/taxonomies/tags',
    filterFn: standardSearchFilter,
    sortFn: standardSortFn,
  });

  return (
    <TableSectionWrapper
      totalPages={totalPages}
      currentPage={currentPage}
      currentLimit={currentLimit}
      basePath='/admin/taxonomies/tags'
    >
      <AdminTagsDataTable data={paginatedData} />
    </TableSectionWrapper>
  );
}
