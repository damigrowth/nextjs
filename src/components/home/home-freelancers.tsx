'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { CarouselPagination } from '@/components/ui/carousel-pagination';
import { FreelancerCard } from '../shared';

// Dummy freelancer data based on the live site
const dummyFreelancers = [
  {
    id: '1',
    displayName: 'Land Services',
    username: 'pouliakakisgmailcom',
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80',
    category: 'Κηπουρός',
    specialization: 'Διαμόρφωση Τοπίου',
    rating: 4.8,
    reviewCount: 15,
    verified: true,
  },
  {
    id: '2',
    displayName: 'George_Petrou',
    username: 'indikos001',
    avatar:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&q=80',
    category: 'Σύμβουλος Μάρκετινγκ',
    specialization: 'Digital Marketing',
    rating: 4.9,
    reviewCount: 28,
    verified: true,
  },
  {
    id: '3',
    displayName: 'ΜΕΤΑΦΟΡΙΚΉ ΛΆΜΠΡΗΣ',
    username: 'lampris',
    avatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80',
    category: 'Μεταφορική Εταιρεία',
    specialization: 'Παροχή Υπηρεσιών Μεταφοράς',
    rating: 4.7,
    reviewCount: 42,
    verified: false,
  },
  {
    id: '4',
    displayName: 'FAdezigns',
    username: 'fadezigns',
    avatar:
      'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&q=80',
    category: 'Graphic Designer',
    specialization: 'Brand Identity & Logo Design',
    rating: 5.0,
    reviewCount: 67,
    verified: true,
  },
  {
    id: '5',
    displayName: 'Μαρία Παπαδοπούλου',
    username: 'maria.design',
    avatar:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&q=80',
    category: 'UX/UI Designer',
    specialization: 'Web & Mobile Design',
    rating: 4.8,
    reviewCount: 35,
    verified: true,
  },
  {
    id: '6',
    displayName: 'Γιάννης Κωνσταντινίδης',
    username: 'john.dev',
    avatar:
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80',
    category: 'Web Developer',
    specialization: 'Full-Stack Development',
    rating: 4.9,
    reviewCount: 51,
    verified: true,
  },
  {
    id: '7',
    displayName: 'Σοφία Νικολάου',
    username: 'sofia.photo',
    avatar:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80',
    category: 'Φωτογράφος',
    specialization: 'Φωτογράφιση Προϊόντων',
    rating: 4.7,
    reviewCount: 29,
    verified: false,
  },
  {
    id: '8',
    displayName: 'Δημήτρης Αλεξίου',
    username: 'dimitris.translate',
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80',
    category: 'Μεταφραστής',
    specialization: 'Αγγλικά-Ελληνικά',
    rating: 5.0,
    reviewCount: 84,
    verified: true,
  },
];

export default function FreelancersHome() {
  const [savedFreelancers, setSavedFreelancers] = useState<string[]>([]);

  const handleSaveFreelancer = (freelancerId: string) => {
    setSavedFreelancers((prev) =>
      prev.includes(freelancerId)
        ? prev.filter((id) => id !== freelancerId)
        : [...prev, freelancerId],
    );
  };

  return (
    <section className='py-16 bg-dark'>
      <div className='container mx-auto px-6'>
        {/* Header Section */}
        <div className='flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-12'>
          {/* Left Side - Title & Description */}
          <div className='flex-1 lg:max-w-2xl'>
            <h2 className='text-2xl font-bold text-fourth leading-8 mb-2'>
              Πιο Δημοφιλείς Επαγγελματίες
            </h2>
            <p className='text-sm font-normal text-white leading-7 mb-4'>
              Βρες τους καλύτερους επαγγελματίες που υπάρχουν στην πλατφόρμα μας
              τώρα.
            </p>
          </div>

          {/* Right Side - View All Button */}
          <div className='flex-shrink-0'>
            <Link
              href='/pros'
              className='inline-flex items-center gap-2 text-accent hover:text-secondary hover:text-gray-900 transition-all duration-300 text-sm font-medium'
            >
              Όλοι οι Επαγγελματίες
              <ArrowRight className='h-4 w-4' />
            </Link>
          </div>
        </div>

        {/* Freelancers Carousel */}
        <div className='relative'>
          <Carousel
            opts={{
              align: 'start',
              slidesToScroll: 1,
            }}
            className='w-full'
          >
            <CarouselContent>
              {Array.from({
                length: Math.ceil(dummyFreelancers.length / 4),
              }).map((_, slideIndex) => (
                <CarouselItem key={slideIndex}>
                  <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
                    {dummyFreelancers
                      .slice(slideIndex * 4, (slideIndex + 1) * 4)
                      .map((freelancer) => (
                        <FreelancerCard
                          key={freelancer.id}
                          freelancer={freelancer}
                          onSave={handleSaveFreelancer}
                          isSaved={savedFreelancers.includes(freelancer.id)}
                        />
                      ))}
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>

            {/* Pagination Dots */}
            <CarouselPagination
              slideCount={Math.ceil(dummyFreelancers.length / 4)}
              variant='light'
              className='mt-6 justify-center'
            />
          </Carousel>
        </div>
      </div>
    </section>
  );
}
