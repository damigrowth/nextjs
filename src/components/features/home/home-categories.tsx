'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Code2,
  Palette,
  Megaphone,
  Languages,
  Camera,
  Sparkles,
  Wrench,
  GraduationCap,
  Calendar,
  Heart,
  Star,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { serviceTaxonomies } from '@/constants/datasets/service-taxonomies';

type ServiceTaxonomy = {
  id: string;
  label: string;
  slug: string;
  description: string;
  icon: string;
  featured: string;
  children: {
    id: string;
    label: string;
    slug: string;
    description: string;
    children?: {
      id: string;
      label: string;
      slug: string;
      description: string;
    }[];
    child_count: number;
  }[];
  child_count: number;
};

type Props = {
  categories?: ServiceTaxonomy[];
};

function getCategoryIcon(slug: string) {
  const iconMap: { [key: string]: React.ReactNode } = {
    'dimiourgia-periexomenou': <Palette size={32} />,
    ekdiloseis: <Calendar size={32} />,
    'eveksia-frontida': <Heart size={32} />,
    mathimata: <GraduationCap size={32} />,
    marketing: <Megaphone size={32} />,
    pliroforiki: <Code2 size={32} />,
    metafraseis: <Languages size={32} />,
    fotografia: <Camera size={32} />,
    katharismos: <Sparkles size={32} />,
    sintirise: <Wrench size={32} />,
  };

  return iconMap[slug] || <Star size={32} />;
}

function CategoryCard({ category }: { category: ServiceTaxonomy }) {
  const { label, slug, children } = category;

  return (
    <div className='bg-transparent rounded-xl mb-1 mt-5 py-10 px-[30px] pb-[30px] relative transition-all duration-300 ease-in-out group'>
      <div className='text-center'>
        <Link href={`/categories/${slug}`} className='inline-block'>
          <div className='relative inline-block text-[40px] text-[#1f4b3f] z-[1] mb-5 transition-all duration-300 ease-in-out before:content-[""] before:bg-[#fbf7ed] before:rounded-full before:absolute before:bottom-[-10px] before:right-[-20px] before:h-[40px] before:w-[40px] before:z-[-1] before:transition-all before:duration-300 before:ease-in-out group-hover:before:bg-[#eafac1]'>
            {getCategoryIcon(slug)}
          </div>
        </Link>
      </div>

      <div className='mt-5'>
        <h4 className='text-[15px] mb-[5px] font-bold leading-[1.5em] text-center'>
          <Link
            href={`/categories/${slug}`}
            className='text-gray-900 hover:text-[#198754] transition-colors'
          >
            {label}
          </Link>
        </h4>

        <p className='mb-0 text-sm text-gray-600 text-center'>
          {children.slice(0, 3).map((sub, i, array) => (
            <span key={i}>
              <Link
                href={`/ipiresies/${sub.slug}`}
                className='hover:text-[#198754] transition-colors'
              >
                {sub.label}
              </Link>
              {i < array.length - 1 && i < 2 ? ', ' : ''}
            </span>
          ))}
        </p>
      </div>
    </div>
  );
}

export default function CategoriesHome({ categories = [] }: Props) {
  const featuredCategories =
    categories.length > 0
      ? categories.filter((cat) => cat.featured === 't').slice(0, 8)
      : serviceTaxonomies.filter((cat) => cat.featured === 't').slice(0, 8);

  const displayCategories = featuredCategories;

  return (
    <section className='pt-5 pb-24'>
      <div className='container mx-auto px-6'>
        <div className='flex flex-wrap items-center mb-10'>
          <div className='w-full lg:w-9/12'>
            <div className='relative mb-8 lg:mb-15'>
              <h2 className='text-xl lg:text-2xl font-bold text-gray-900 mb-3'>
                Κατηγορίες
              </h2>
              <p className='text-gray-600 font-sans'>
                Ανακάλυψε 100+ κατηγορίες υπηρεσιών.
              </p>
            </div>
          </div>
          <div className='w-full lg:w-3/12'>
            <div className='text-left lg:text-right mb-4 lg:mb-2'>
              <Button
                asChild
                variant='link'
                className='text-gray-800 hover:text-primary hover:no-underline'
              >
                <Link
                  href='/categories'
                  className='inline-flex items-center gap-2'
                >
                  Όλες οι Κατηγορίες
                  <ArrowRight className='h-4 w-4' />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <div className='hidden lg:flex flex-wrap'>
          {displayCategories.slice(0, 8).map((category, index) => {
            const getBootstrapClasses = (index: number) => {
              const baseClasses = 'w-1/2 sm:w-1/2 lg:w-1/3 xl:w-1/4';
              let borderClasses = 'border border-[#e9e9e9] -mb-px';

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
          <div className='w-full'>
            <div className='ui-browser pb-5'>
              <Carousel className='w-full'>
                <CarouselContent>
                  {displayCategories.map((category, index) => (
                    <CarouselItem
                      key={index}
                      className='basis-full sm:basis-1/2'
                    >
                      <div className='p-1'>
                        <div className='border border-[#e9e9e9] shadow-sm rounded-xl'>
                          <CategoryCard category={category} />
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>

                <div className='flex flex-wrap mt-4'>
                  <div className='w-auto'>
                    <CarouselPrevious className='static translate-y-0 h-10 w-10 swiper__btn btn__prev__001' />
                  </div>
                  <div className='w-auto flex-1'>
                    <div className='swiper__pagination swiper__pagination__001 text-center'></div>
                  </div>
                  <div className='w-auto'>
                    <CarouselNext className='static translate-y-0 h-10 w-10 swiper__btn btn__next__001' />
                  </div>
                </div>
              </Carousel>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
