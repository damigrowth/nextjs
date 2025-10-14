'use client';

import { SearchFilter, SelectFilter, FilterContainer } from './filters/filter-components';
import { proTaxonomies } from '@/constants/datasets/pro-taxonomies';

export function AdminSkillsFilters() {
  const categoryOptions = proTaxonomies.map((cat) => ({
    value: cat.id,
    label: cat.label,
  }));

  return (
    <FilterContainer>
      <SearchFilter />
      <SelectFilter
        id='category'
        label='Category'
        options={categoryOptions}
        includeNone={true}
      />
    </FilterContainer>
  );
}
