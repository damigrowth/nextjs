import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { DatasetItem } from '@/lib/types/datasets';

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
          href={item.href || `/${type}/${item.slug}`}
          className='text-sm text-dark hover:text-fourth hover:underline transition-colors'
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
  data: DatasetItem[];
  type: 'pros' | 'ipiresies';
}) => {
  // Data is already flattened and filtered server-side
  // Limit to 90 items maximum (15 columns × 6 items each)
  const limitedSubcategories = data.slice(0, 90);
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

interface HomeTaxonomiesTabsProps {
  proSubcategories: DatasetItem[];
  serviceSubcategories: DatasetItem[];
}

export default function HomeTaxonomiesTabs({
  proSubcategories,
  serviceSubcategories,
}: HomeTaxonomiesTabsProps) {
  return (
    <Tabs defaultValue='services' className='w-full'>
      <div className='mb-12'>
        <TabsList className='bg-transparent border-none p-0 h-auto space-x-12'>
          <TabsTrigger
            value='services'
            className='bg-transparent data-[state=active]:bg-transparent border-none p-0 text-xl font-bold data-[state=active]:text-dark text-dark/30 hover:text-dark data-[state=active]:shadow-none transition-colors'
          >
            Κατηγορίες Υπηρεσιών
          </TabsTrigger>
          <TabsTrigger
            value='pros'
            className='bg-transparent data-[state=active]:bg-transparent border-none p-0 text-xl font-bold data-[state=active]:text-dark text-dark/30 hover:text-dark data-[state=active]:shadow-none transition-colors'
          >
            Κατηγορίες Επαγγελμάτων
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value='services' className='mt-0'>
        <TaxonomiesGrid data={serviceSubcategories} type='ipiresies' />
      </TabsContent>

      <TabsContent value='pros' className='mt-0'>
        <TaxonomiesGrid data={proSubcategories} type='pros' />
      </TabsContent>
    </Tabs>
  );
}
