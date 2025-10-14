'use client';

import { SearchFilter, SelectFilter, FilterContainer } from './filters/filter-components';
import { serviceTaxonomies } from '@/constants/datasets/service-taxonomies';

export function AdminSubcategoriesFilters() {
  const categoryOptions = serviceTaxonomies.map((category) => ({
    value: category.id,
    label: category.label,
  }));

  return (
    <FilterContainer>
      <SearchFilter placeholder='Search by label or slug...' />
      <SelectFilter
        id='category'
        label='Category'
        placeholder='Filter by Category'
        options={categoryOptions}
        className='w-[220px]'
      />
    </FilterContainer>
  );
}
