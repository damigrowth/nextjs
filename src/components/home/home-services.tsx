import React from 'react';
import { serviceTaxonomies } from '@/constants/datasets/service-taxonomies';
import { CategoryTabs } from './category-tabs';
import { ServicesCarouselWrapper } from './services-carousel-wrapper';
import type { ServiceCardData } from '@/actions/services/get-services';

interface ServicesHomeProps {
  initialServices: ServiceCardData[];
}

export default function ServicesHome({ initialServices }: ServicesHomeProps) {
  // Get main categories for tabs - server-side computation
  const mainCategories = [
    { id: 'all', label: 'Όλες', slug: 'all' },
    ...serviceTaxonomies.slice(0, 6).map((cat) => ({
      id: cat.id,
      label: cat.label,
      slug: cat.slug,
    })),
  ];

  // Create service groups by category for server-side rendering
  const servicesByCategory = {
    all: initialServices,
    ...Object.fromEntries(
      mainCategories.slice(1).map((category) => [
        category.id,
        initialServices.filter((service) => {
          const serviceCat = serviceTaxonomies.find(
            (cat) => cat.label === service.category,
          );
          return serviceCat?.id === category.id;
        }),
      ]),
    ),
  };

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
        <ServicesCarouselWrapper servicesByCategory={servicesByCategory} />
      </div>
    </section>
  );
}
