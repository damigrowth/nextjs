'use client';

import { useState } from 'react';
import Link from 'next/link';
import { proTaxonomies } from '@/constants/datasets/pro-taxonomies';
import { serviceTaxonomies } from '@/constants/datasets/service-taxonomies';

const chunk = (arr: any[], size: number) =>
  Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
    arr.slice(i * size, i * size + size),
  );

const TaxonomyColumn = ({
  items,
  type,
}: {
  items: any[];
  type: 'pros' | 'ipiresies';
}) => (
  <ul className='list-none p-0 m-0'>
    {items.map((item) => (
      <li key={item.id} className='leading-10 list-none'>
        <Link
          href={`/${type}/${item.slug}`}
          className='text-[15px] text-[rgb(34,34,34)] hover:text-[rgb(91,187,123)] hover:underline transition-colors'
        >
          {type === 'pros' ? item.plural || item.label : item.label}
        </Link>
      </li>
    ))}
  </ul>
);

const TaxonomiesGrid = ({
  data,
  type,
}: {
  data: any[];
  type: 'pros' | 'ipiresies';
}) => {
  // Extract all subcategories from the nested structure
  const subcategories = data.flatMap(
    (category) =>
      category.children?.flatMap((child: any) =>
        // For service taxonomies (3-level), get the deepest level subcategories
        child.children && child.children.length > 0 ? child.children : [child],
      ) || [],
  );

  // Limit to 90 items maximum (15 columns × 6 items each)
  const limitedSubcategories = subcategories.slice(0, 90);
  const columns = chunk(limitedSubcategories, 6).slice(0, 15);
  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-5 gap-y-10'>
      {columns.map((column, index) => (
        <div key={index} className='space-y-0'>
          <TaxonomyColumn items={column} type={type} />
        </div>
      ))}
    </div>
  );
};

export default function HomeTaxonomies() {
  const [activeTab, setActiveTab] = useState<'pros' | 'services'>('pros');

  return (
    <section className='pt-16 pb-28 bg-[#fbf7ed]'>
      <div className='container mx-auto px-6'>
        <div className='mb-12'>
          <div className='flex space-x-12'>
            <button
              onClick={() => setActiveTab('pros')}
              className={`text-[20px] font-bold transition-colors ${
                activeTab === 'pros'
                  ? 'text-[#222]'
                  : 'text-[#222]/30 hover:text-[#222]'
              }`}
            >
              Κατηγορίες Επαγγελμάτων
            </button>
            <button
              onClick={() => setActiveTab('services')}
              className={`text-[20px] font-bold transition-colors ${
                activeTab === 'services'
                  ? 'text-[#222]'
                  : 'text-[#222]/30 hover:text-[#222]'
              }`}
            >
              Κατηγορίες Υπηρεσιών
            </button>
          </div>
        </div>

        <div>
          {activeTab === 'pros' && (
            <TaxonomiesGrid data={proTaxonomies} type='pros' />
          )}
          {activeTab === 'services' && (
            <TaxonomiesGrid data={serviceTaxonomies} type='ipiresies' />
          )}
        </div>
      </div>
    </section>
  );
}
