import React from 'react';
import { CategoryTabs } from './category-tabs';
import { ServicesCarouselWrapper } from './services-carousel-wrapper';
import { ServiceCardData } from '@/lib/types';

interface ServicesHomeProps {
  mainCategories: Array<{
    id: string;
    label: string;
    slug: string;
  }>;
  servicesByCategory: Record<string, ServiceCardData[]>;
  savedServiceIds?: number[];
}

export default function ServicesHome({
  mainCategories,
  servicesByCategory,
  savedServiceIds,
}: ServicesHomeProps) {
  return (
    <section className='py-16 bg-orangy'>
      <div className='container mx-auto px-6'>
        {/* Header Section */}
        <div className='flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-12'>
          {/* Left Side - Title & Description */}
          <div className='flex-1 lg:max-w-2xl'>
            <h2 className='text-2xl font-bold text-dark leading-8 mb-2'>
              Δημοφιλείς Υπηρεσίες
            </h2>
            <p className='text-sm font-normal text-dark leading-7 mb-4'>
              Οι υπηρεσίες με τη μεγαλύτερη ζήτηση.
            </p>
          </div>

          {/* Right Side - Category Tabs */}
          <CategoryTabs categories={mainCategories} />
        </div>

        {/* Services Carousel */}
        <ServicesCarouselWrapper
          servicesByCategory={servicesByCategory}
          savedServiceIds={savedServiceIds}
        />
      </div>
    </section>
  );
}
