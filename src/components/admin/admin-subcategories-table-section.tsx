import { AdminSubcategoriesDataTable } from './admin-subcategories-data-table';
import { getTaxonomyWithStaging } from '@/actions/admin/get-taxonomy-with-staging';
import { DatasetItem } from '@/lib/types/datasets';
import {
  processTableData,
  TableSectionWrapper,
  standardSearchFilter,
  combineFilters,
  BaseSearchParams,
} from './utils/table-section-utils';

interface AdminSubcategoriesTableSectionProps {
  searchParams: BaseSearchParams;
}

interface SubcategoryItem extends DatasetItem {
  subdivisionCount: number;
  categoryLabel?: string;
  parentCategoryId?: string;
}

export async function AdminSubcategoriesTableSection({
  searchParams,
}: AdminSubcategoriesTableSectionProps) {
  // Flatten subcategories with parent category info (including staged changes)
  const serviceTaxonomies = await getTaxonomyWithStaging('service');
  const subcategories: SubcategoryItem[] = [];
  serviceTaxonomies.forEach((category) => {
    category.children?.forEach((subcategory) => {
      subcategories.push({
        ...subcategory,
        subdivisionCount: subcategory.children?.length || 0,
        categoryLabel: category.label,
        parentCategoryId: category.id,
      });
    });
  });

  const categoryFilter = (item: SubcategoryItem, params: BaseSearchParams) => {
    const { category } = params;
    return !category || category === 'all' || item.parentCategoryId === category;
  };

  const { paginatedData, totalPages, currentPage, currentLimit } = processTableData({
    data: subcategories,
    searchParams,
    basePath: '/admin/taxonomies/service/subcategories',
    filterFn: combineFilters(standardSearchFilter, categoryFilter),
  });

  return (
    <TableSectionWrapper
      totalPages={totalPages}
      currentPage={currentPage}
      currentLimit={currentLimit}
      basePath='/admin/taxonomies/service/subcategories'
    >
      <AdminSubcategoriesDataTable data={paginatedData} />
    </TableSectionWrapper>
  );
}
