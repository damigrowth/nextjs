import {
  TaxonomyListPage,
  type TaxonomyListPageConfig,
  AdminSubdivisionsFilters,
  AdminSubdivisionsTableSection,
  AdminSubdivisionsTableSkeleton,
} from '@/components/admin';

interface SubdivisionsPageProps {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    search?: string;
    category?: string;
    subcategory?: string;
    sortBy?: string;
    sortOrder?: string;
  }>;
}

const config: TaxonomyListPageConfig = {
  title: 'Service Subdivisions',
  createPath: '/admin/taxonomies/service/subdivisions/create',
  createLabel: 'Create Subdivision',
  FiltersComponent: AdminSubdivisionsFilters,
  TableComponent: AdminSubdivisionsTableSection,
  SkeletonComponent: AdminSubdivisionsTableSkeleton,
};

export default async function SubdivisionsPage({
  searchParams,
}: SubdivisionsPageProps) {
  const params = await searchParams;
  return <TaxonomyListPage config={config} searchParams={params} />;
}
