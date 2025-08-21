'use client';

import React, { useState } from 'react';
import { serviceTaxonomies } from '@/constants/datasets/service-taxonomies';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { CarouselPagination } from '@/components/ui/carousel-pagination';
import { Button } from '@/components/ui/button';
import ServiceCard from './service-card';

// Dummy service data based on Prisma schema
const dummyServices = [
  {
    id: '1',
    title:
      'Σχεδιασμός Λογότυπου και Εταιρικής Ταυτότητας για την Επιχείρησή σας',
    category: 'Γραφιστική & Design',
    slug: 'logo-design-corporate-identity',
    price: 150,
    rating: 4.8,
    reviewCount: 23,
    media: [
      {
        id: 'm1',
        url: 'https://images.unsplash.com/photo-1586717799252-bd134ad00e26?w=800&q=80',
        type: 'image' as const,
        alt: 'Logo design portfolio',
      },
      {
        id: 'm2',
        url: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&q=80',
        type: 'image' as const,
        alt: 'Brand identity examples',
      },
    ],
    profile: {
      id: 'p1',
      displayName: 'Μαρία Παπαδοπούλου',
      username: 'maria.design',
      avatar:
        'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&q=80',
    },
  },
  {
    id: '2',
    title: 'Ανάπτυξη Ιστοσελίδας με WordPress - Responsive & SEO Optimized',
    category: 'Προγραμματισμός & Τεχνολογία',
    slug: 'wordpress-website-development',
    price: 500,
    rating: 4.9,
    reviewCount: 45,
    media: [
      {
        id: 'm3',
        url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
        type: 'image' as const,
        alt: 'Website development',
      },
    ],
    profile: {
      id: 'p2',
      displayName: 'Γιάννης Κωνσταντινίδης',
      username: 'john.dev',
      avatar:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80',
    },
  },
  {
    id: '3',
    title:
      'Φωτογράφιση Προϊόντων για E-shop - Professional Product Photography',
    category: 'Φωτογραφία & Video',
    slug: 'product-photography-eshop',
    price: 80,
    rating: 4.7,
    reviewCount: 34,
    media: [
      {
        id: 'm4',
        url: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&q=80',
        type: 'image' as const,
        alt: 'Product photography',
      },
      {
        id: 'm5',
        url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
        type: 'image' as const,
        alt: 'Product shots',
      },
      {
        id: 'm6',
        url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&q=80',
        type: 'image' as const,
        alt: 'Studio photography',
      },
    ],
    profile: {
      id: 'p3',
      displayName: 'Σοφία Νικολάου',
      username: 'sofia.photo',
      avatar:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&q=80',
    },
  },
  {
    id: '4',
    title: 'Μετάφραση Κειμένων Αγγλικά-Ελληνικά - Επαγγελματική & Ακριβής',
    category: 'Γλώσσες & Μετάφραση',
    slug: 'english-greek-translation',
    price: 25,
    rating: 5.0,
    reviewCount: 67,
    media: [
      {
        id: 'm7',
        url: 'https://images.unsplash.com/photo-1544396821-4dd40b938f0e?w=800&q=80',
        type: 'image' as const,
        alt: 'Translation services',
      },
    ],
    profile: {
      id: 'p4',
      displayName: 'Δημήτρης Αλεξίου',
      username: 'dimitris.translate',
      avatar:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&q=80',
    },
  },
  {
    id: '5',
    title:
      'Digital Marketing Strategy & Social Media Management για την Επιχείρησή σας',
    category: 'Marketing & Διαφήμιση',
    slug: 'digital-marketing-social-media',
    price: 300,
    rating: 4.6,
    reviewCount: 28,
    media: [
      {
        id: 'm8',
        url: 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=800&q=80',
        type: 'image' as const,
        alt: 'Digital marketing',
      },
    ],
    profile: {
      id: 'p5',
      displayName: 'Ελένη Γεωργίου',
      username: 'elena.marketing',
      avatar:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80',
    },
  },
  {
    id: '6',
    title: 'Λογιστικές Υπηρεσίες για Μικρές Επιχειρήσεις - Τήρηση Βιβλίων',
    category: 'Επιχειρηματικές Υπηρεσίες',
    slug: 'accounting-services-small-business',
    price: 200,
    rating: 4.8,
    reviewCount: 41,
    media: [
      {
        id: 'm9',
        url: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80',
        type: 'image' as const,
        alt: 'Accounting services',
      },
    ],
    profile: {
      id: 'p6',
      displayName: 'Αντώνης Παπαγιάννης',
      username: 'antonis.accounting',
      avatar:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80',
    },
  },
  {
    id: '7',
    title: 'Μαθήματα Κιθάρας Online - Αρχάριοι έως Προχωρημένοι',
    category: 'Εκπαίδευση & Κατάρτιση',
    slug: 'online-guitar-lessons',
    price: 35,
    rating: 4.9,
    reviewCount: 56,
    media: [
      {
        id: 'm10',
        url: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800&q=80',
        type: 'image' as const,
        alt: 'Guitar lessons',
      },
    ],
    profile: {
      id: 'p7',
      displayName: 'Νίκος Σταμάτης',
      username: 'nikos.music',
      avatar:
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80',
    },
  },
  {
    id: '8',
    title: 'Καθαρισμός Γραφείων & Επαγγελματικών Χώρων - Εβδομαδιαίο Service',
    category: 'Υπηρεσίες Σπιτιού & Καθαρισμού',
    slug: 'office-cleaning-services',
    price: 120,
    rating: 4.5,
    reviewCount: 33,
    media: [
      {
        id: 'm11',
        url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&q=80',
        type: 'image' as const,
        alt: 'Cleaning services',
      },
    ],
    profile: {
      id: 'p8',
      displayName: 'Κατερίνα Μιχαήλ',
      username: 'katerina.clean',
      avatar:
        'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&q=80',
    },
  },
];

export default function ServicesHome() {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [savedServices, setSavedServices] = useState<string[]>([]);

  // Get main categories for tabs
  const mainCategories = [
    { id: 'all', label: 'Όλες', slug: 'all' },
    ...serviceTaxonomies.slice(0, 6).map((cat) => ({
      id: cat.id,
      label: cat.label,
      slug: cat.slug,
    })),
  ];

  // Filter services based on active category
  const filteredServices =
    activeCategory === 'all'
      ? dummyServices
      : dummyServices.filter((service) => {
          const category = serviceTaxonomies.find(
            (cat) => cat.label === service.category,
          );
          return category?.id === activeCategory;
        });

  const handleSaveService = (serviceId: string) => {
    setSavedServices((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId],
    );
  };

  return (
    <section className='py-16 bg-[#fbf7ed]'>
      <div className='container mx-auto px-6'>
        {/* Header Section */}
        <div className='flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-12'>
          {/* Left Side - Title & Description */}
          <div className='flex-1 lg:max-w-2xl'>
            <h2 className='text-[24px] font-bold text-[rgb(34,34,34)] leading-[31.5px] mb-2'>
              Δημοφιλείς Υπηρεσίες
            </h2>
            <p className='text-[15px] font-normal text-[rgb(34,34,34)] leading-[27.75px] mb-[15px]'>
              Οι υπηρεσίες με τη μεγαλύτερη ζήτηση.
            </p>
          </div>

          {/* Right Side - Category Tabs */}
          <div className='flex flex-wrap gap-2'>
            {mainCategories.map((category) => (
              <Button
                key={category.id}
                variant='ghost'
                size='sm'
                className={`px-4 py-5 rounded-full transition-all duration-300 font-medium text-base text-[#222] hover:text-third hover:bg-white border-none hover:border-gray-200 hover:shadow-sm ${
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
        </div>

        {/* Services Carousel */}
        <div className='relative'>
          <Carousel
            opts={{
              align: 'start',
              slidesToScroll: 1,
            }}
            className='w-full'
          >
            <CarouselContent className='-ml-4'>
              {Array.from({
                length: Math.ceil(filteredServices.length / 4),
              }).map((_, slideIndex) => (
                <CarouselItem key={slideIndex} className='pl-4'>
                  <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
                    {filteredServices
                      .slice(slideIndex * 4, (slideIndex + 1) * 4)
                      .map((service) => (
                        <ServiceCard
                          key={service.id}
                          service={service}
                          onSave={handleSaveService}
                          isSaved={savedServices.includes(service.id)}
                        />
                      ))}
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>

            {/* Navigation Arrows */}
            <CarouselPrevious className='absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 bg-white hover:bg-gray-50 border border-gray-200 shadow-md h-10 w-10 rounded-full' />
            <CarouselNext className='absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 bg-white hover:bg-gray-50 border border-gray-200 shadow-md h-10 w-10 rounded-full' />

            {/* Pagination Dots */}
            <CarouselPagination
              slideCount={Math.ceil(filteredServices.length / 4)}
              className='mt-6 justify-center'
            />
          </Carousel>
        </div>
      </div>
    </section>
  );
}
