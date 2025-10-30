'use client';

import { Button } from '@/components/ui/button';
import { useHomeFeaturedServicesStore } from '@/lib/stores/use-home-featured-services-store';

interface Category {
  id: string;
  label: string;
  slug: string;
}

interface CategoryTabsProps {
  categories: Category[];
}

export function CategoryTabs({ categories }: CategoryTabsProps) {
  const { activeCategory, setActiveCategory } = useHomeFeaturedServicesStore();

  return (
    <div className='flex flex-wrap gap-2 justify-end w-2/3'>
      {categories.map((category) => (
        <Button
          key={category.id}
          variant='ghost'
          size='sm'
          className={`px-4 py-5 rounded-full transition-all duration-300 font-medium text-base text-dark hover:text-third hover:bg-white border-none hover:border-gray-200 hover:shadow-sm ${
            activeCategory === category.id
              ? 'bg-white text-third border border-gray-200 shadow-sm'
              : 'bg-transparent'
          }`}
          onClick={() => setActiveCategory(category.id)}
        >
          {category.label}
        </Button>
      ))}
    </div>
  );
}
