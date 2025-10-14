'use client';

import { SearchFilter, SelectFilter, FilterContainer } from './filters/filter-components';
import { proTaxonomies } from '@/constants/datasets/pro-taxonomies';

export function AdminProSubcategoriesFilters() {
  const typeOptions = [
    { value: 'freelancer', label: 'Freelancer' },
    { value: 'company', label: 'Company' },
  ];

  const categoryOptions = proTaxonomies.map((cat) => ({
    value: cat.id,
    label: cat.label,
  }));

  return (
    <FilterContainer>
      <SearchFilter placeholder='Search by name, slug, or category...' />
      <SelectFilter
        id='type'
        label='Type'
        options={typeOptions}
        className='w-full md:w-[200px]'
      />
      <SelectFilter
        id='category'
        label='Parent Category'
        options={categoryOptions}
        className='w-full md:w-[250px]'
      />
    </FilterContainer>
  );
}
