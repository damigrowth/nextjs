import {
  TaxonomyListPage,
  type TaxonomyListPageConfig,
  AdminProCategoriesFilters,
  AdminProCategoriesTableSection,
  AdminProCategoriesTableSkeleton,
} from '@/components/admin';

interface ProCategoriesPageProps {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
  }>;
}

const config: TaxonomyListPageConfig = {
  title: 'Pro Categories',
  createPath: '/admin/taxonomies/pro/categories/create',
  createLabel: 'Create Category',
  FiltersComponent: AdminProCategoriesFilters,
  TableComponent: AdminProCategoriesTableSection,
  SkeletonComponent: AdminProCategoriesTableSkeleton,
};

export default async function ProCategoriesPage({
  searchParams,
}: ProCategoriesPageProps) {
  const params = await searchParams;
  return <TaxonomyListPage config={config} searchParams={params} />;
}
