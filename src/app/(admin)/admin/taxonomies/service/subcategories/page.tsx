import {
  TaxonomyListPage,
  type TaxonomyListPageConfig,
  AdminSubcategoriesFilters,
  AdminSubcategoriesTableSection,
  AdminSubcategoriesTableSkeleton,
} from '@/components/admin';

export const dynamic = 'force-dynamic';

const config: TaxonomyListPageConfig = {
  title: 'Service Subcategories',
  createPath: '/admin/taxonomies/service/subcategories/create',
  createLabel: 'Create Subcategory',
  FiltersComponent: AdminSubcategoriesFilters,
  TableComponent: AdminSubcategoriesTableSection,
  SkeletonComponent: AdminSubcategoriesTableSkeleton,
};

interface SubcategoriesPageProps {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    search?: string;
    category?: string;
    sortBy?: string;
    sortOrder?: string;
  }>;
}

export default async function SubcategoriesPage({
  searchParams,
}: SubcategoriesPageProps) {
  const params = await searchParams;
  return <TaxonomyListPage config={config} searchParams={params} />;
}
