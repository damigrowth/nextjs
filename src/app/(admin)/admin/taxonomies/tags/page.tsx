import {
  TaxonomyListPage,
  type TaxonomyListPageConfig,
  AdminTagsFilters,
  AdminTagsTableSection,
  AdminTagsTableSkeleton,
} from '@/components/admin';

export const dynamic = 'force-dynamic';

const config: TaxonomyListPageConfig = {
  title: 'Tags',
  createPath: '/admin/taxonomies/tags/create',
  createLabel: 'Create Tag',
  FiltersComponent: AdminTagsFilters,
  TableComponent: AdminTagsTableSection,
  SkeletonComponent: AdminTagsTableSkeleton,
};

interface TagsPageProps {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
  }>;
}

export default async function TagsPage({ searchParams }: TagsPageProps) {
  const params = await searchParams;
  return <TaxonomyListPage config={config} searchParams={params} />;
}
