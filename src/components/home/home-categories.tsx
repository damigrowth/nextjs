'use client';

import React from 'react';
import { Star } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { CarouselPagination } from '@/components/ui/carousel-pagination';
import { SectionHeader } from '@/components/ui/section-header';
import { serviceTaxonomies } from '@/constants/datasets/service-taxonomies';
import { getCategoryIcon } from '@/constants/datasets/category-icons';
import type { DatasetItem } from '@/lib/types/datasets';
import { NextLink } from '../shared';

type Props = {
  categories?: DatasetItem[];
};

function getCategoryIconComponent(iconKey?: string) {
  const IconComponent = iconKey ? getCategoryIcon(iconKey) : undefined;
  return IconComponent ? <IconComponent size={40} /> : <Star size={40} />;
}

function CategoryCard({ category }: { category: DatasetItem }) {
  const { label, slug, subcategories, icon } = category;

  return (
    <div className='bg-transparent rounded-xl p-6 relative transition-all duration-300 ease-in-out group'>
      <div className='text-left'>
        <NextLink href={`/categories/${slug}`} className='inline-block' aria-label={label}>
          <div className='relative inline-block text-4xl text-primary z-10 mb-4 sm:mb-5 transition-all duration-300 ease-in-out before:content-[""] before:bg-orangy before:rounded-full before:absolute before:-bottom-2.5 before:-right-5 before:h-10 before:w-10 before:-z-10 before:transition-all before:duration-300 before:ease-in-out group-hover:before:bg-sixth'>
            {getCategoryIconComponent(icon)}
          </div>
        </NextLink>
      </div>

      <div className='mt-2'>
        <h2 className='text-sm mb-1.5 font-bold leading-6 text-left'>
          <NextLink
            href={`/categories/${slug}`}
            className='text-gray-900 hover:text-third transition-colors'
          >
            {label}
          </NextLink>
        </h2>

        <p className='mb-0 text-sm text-gray-600 text-left'>
          {(subcategories || []).map((sub, i, array) => (
            <span key={sub.id}>
              <NextLink
                href={`/ipiresies/${sub.slug}`}
                className='hover:text-third transition-colors'
              >
                {sub.label}
              </NextLink>
              {i < array.length - 1 ? ', ' : ''}
            </span>
          ))}
        </p>
      </div>
    </div>
  );
}

export default function CategoriesHome({ categories = [] }: Props) {
  // Use provided categories with subcategories or fallback to featured categories from static data
  const displayCategories =
    categories.length > 0
      ? categories
      : serviceTaxonomies
          .filter((cat) => cat.featured === true)
          .slice(0, 8)
          .map((cat) => ({
            id: cat.id,
            label: cat.label,
            slug: cat.slug,
            icon: cat.icon,
            featured: cat.featured,
            subcategories: (cat.children || []).slice(0, 3).map((sub) => ({
              id: sub.id,
              label: sub.label,
              slug: sub.slug,
              count: 0,
            })),
          }));

  return (
    <section className='py-8 sm:py-12 md:py-16 lg:pb-24'>
      <div className='container mx-auto px-4 sm:px-6'>
        <SectionHeader
          title='Κατηγορίες'
          description='Ανακάλυψε 100+ κατηγορίες υπηρεσιών.'
          linkHref='/categories'
          linkText='Όλες οι Κατηγορίες'
        />

        <div className='hidden lg:flex flex-wrap'>
          {displayCategories.slice(0, 8).map((category, index) => {
            const getBootstrapClasses = (index: number) => {
              const baseClasses = 'w-1/2 sm:w-1/2 lg:w-1/3 xl:w-1/4';
              let borderClasses = 'border border-border -mb-px';

              switch (index) {
                case 0:
                  return `${baseClasses} ${borderClasses} border-l-0 border-t-0`;
                case 1:
                  return `${baseClasses} ${borderClasses} border-t-0`;
                case 2:
                  return `${baseClasses} ${borderClasses} border-t-0`;
                case 3:
                  return `${baseClasses} ${borderClasses} border-t-0 border-r-0`;
                case 4:
                  return `${baseClasses} ${borderClasses} border-l-0 border-b-0`;
                case 5:
                  return `${baseClasses} ${borderClasses} border-b-0`;
                case 6:
                  return `${baseClasses} ${borderClasses} border-b-0`;
                case 7:
                  return `${baseClasses} ${borderClasses} border-b-0 border-r-0`;
                default:
                  return `${baseClasses} ${borderClasses}`;
              }
            };

            return (
              <div key={index} className={getBootstrapClasses(index)}>
                <CategoryCard category={category} />
              </div>
            );
          })}
        </div>

        <div className='block lg:hidden'>
          <Carousel
            opts={{
              align: 'start',
              slidesToScroll: 1,
            }}
            className='w-full'
          >
            <CarouselContent className='-ml-2 sm:-ml-4'>
              {displayCategories.map((category, index) => (
                <CarouselItem
                  key={index}
                  className='pl-2 sm:pl-4 basis-full sm:basis-1/2 mb-1'
                >
                  <div className='border border-border shadow-sm rounded-xl'>
                    <CategoryCard category={category} />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>

            {/* Navigation Controls - hide on mobile, show on larger screens */}
            {displayCategories.length > 1 && (
              <>
                <CarouselPrevious className='hidden sm:flex' />
                <CarouselNext className='hidden sm:flex' />
              </>
            )}

            {/* Pagination Dots */}
            {displayCategories.length > 1 && (
              <CarouselPagination
                slideCount={displayCategories.length}
                className='mt-4 sm:mt-6 justify-center'
              />
            )}
          </Carousel>
        </div>
      </div>
    </section>
  );
}
