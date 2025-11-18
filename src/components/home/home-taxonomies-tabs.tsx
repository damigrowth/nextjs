import NextLink from '@/components/shared/next-link';
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
        <NextLink
          href={item.href || `/${type}/${item.slug}`}
          className='text-sm text-dark hover:text-fourth hover:underline transition-colors'
        >
          {type === 'pros' ? item.plural || item.label : item.label}
        </NextLink>
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
  const limitedSubcategories = data.slice(0, 100);

  // Calculate items per column for 5 columns
  const itemsPerColumn = Math.ceil(limitedSubcategories.length / 5);
  const columns = Array.from({ length: 5 }, (_, i) =>
    limitedSubcategories.slice(i * itemsPerColumn, (i + 1) * itemsPerColumn),
  );

  return (
    <div className='flex flex-col sm:flex-row gap-x-5'>
      {columns.map((column, columnIndex) => (
        <div key={columnIndex} className='flex flex-col flex-1'>
          {column.map((item) => (
            <NextLink
              key={item.id}
              href={item.href || `/${type}/${item.slug}`}
              className='text-sm text-dark hover:text-fourth hover:underline transition-colors leading-10'
            >
              {type === 'pros' ? item.plural || item.label : item.label}
            </NextLink>
          ))}
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
      <div className='mb-8 sm:mb-10 md:mb-12'>
        <TabsList className='bg-transparent border-none p-0 h-auto flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-8 md:space-x-12  justify-start'>
          <TabsTrigger
            value='services'
            className='bg-transparent data-[state=active]:bg-transparent border-none p-0 text-xl font-bold data-[state=active]:text-dark text-dark/30 hover:text-dark data-[state=active]:shadow-none transition-colors w-full sm:w-auto text-left justify-start'
          >
            Κατηγορίες Υπηρεσιών
          </TabsTrigger>
          <TabsTrigger
            value='pros'
            className='bg-transparent data-[state=active]:bg-transparent border-none p-0 text-xl font-bold data-[state=active]:text-dark text-dark/30 hover:text-dark data-[state=active]:shadow-none transition-colors w-full sm:w-auto text-left justify-start'
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
