import {
  TaxonomyListPage,
  type TaxonomyListPageConfig,
  AdminProSubcategoriesFilters,
  AdminProSubcategoriesTableSection,
  AdminProSubcategoriesTableSkeleton,
} from '@/components/admin';

export const dynamic = 'force-dynamic';

interface ProSubcategoriesPageProps {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    search?: string;
    type?: string;
    category?: string;
    sortBy?: string;
    sortOrder?: string;
  }>;
}

const config: TaxonomyListPageConfig = {
  title: 'Pro Subcategories',
  createPath: '/admin/taxonomies/pro/subcategories/create',
  createLabel: 'Create Subcategory',
  FiltersComponent: AdminProSubcategoriesFilters,
  TableComponent: AdminProSubcategoriesTableSection,
  SkeletonComponent: AdminProSubcategoriesTableSkeleton,
};

export default async function ProSubcategoriesPage({
  searchParams,
}: ProSubcategoriesPageProps) {
  const params = await searchParams;
  return <TaxonomyListPage config={config} searchParams={params} />;
}
