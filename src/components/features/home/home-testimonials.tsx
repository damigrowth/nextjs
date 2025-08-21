'use client';

import React from 'react';
import Image from 'next/image';
import { Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { testimonials } from '@/constants/datasets/data';

type TestimonialData = {
  id: string;
  title: string;
  comment: string;
  name: string;
  category: string;
  image: string;
  active?: boolean;
};

type Props = {
  testimonials?: TestimonialData[];
};

function TestimonialCard({ testimonial }: { testimonial: TestimonialData }) {
  return (
    <div className='rounded-2xl bg-white mb-[15px] px-10 py-[45px] pb-[30px] relative'>
      <div className='border-b border-[#e9e9e9] mb-5 pb-[30px]'>
        <h3 className='text-secondary mb-[25px] text-lg font-bold'>
          {testimonial.title}
        </h3>
        <Quote
          size={36}
          className='text-[#f1fcfa] absolute right-[60px] top-[30px]'
        />
        <p className='text-primary text-lg leading-8 font-medium'>
          {testimonial.comment}
        </p>
      </div>
      <div className='flex items-center'>
        <div className='flex-shrink-0'>
          <Image
            height={60}
            width={60}
            className='h-[60px] w-[60px] object-cover rounded-full'
            src={testimonial.image}
            alt='avatar'
          />
        </div>
        <div className='flex-grow ml-3'>
          <p className='mb-0 font-semibold'>{testimonial.name}</p>
          <p className='text-[14px] mb-0 text-gray-600'>
            {testimonial.category}
          </p>
        </div>
      </div>
    </div>
  );
}

function StatItem({
  value,
  suffix = '',
  description,
}: {
  value: string | number;
  suffix?: string;
  description: string;
}) {
  return (
    <div className='transition-all duration-400 ease-in-out px-4'>
      <div className='flex items-baseline mb-2'>
        <span className='text-[#222] font-bold text-2xl leading-[40px] font-sans'>
          {value}
        </span>
        {suffix && (
          <span className='text-[#222] font-bold text-2xl leading-[40px] font-sans ml-1'>
            {suffix}
          </span>
        )}
      </div>
      <p className='mb-0 text-sm leading-relaxed'>{description}</p>
    </div>
  );
}

export default function TestimonialsHome({
  testimonials: testimonialsProps,
}: Props) {
  // Use provided testimonials or fallback to default data
  const testimonialsItems = testimonialsProps || testimonials;

  return (
    <section className='py-[120px] relative bg-gradient-to-b from-[#f1fcfa] to-[#fbf7ed]'>
      <div className='container mx-auto px-6'>
        <div className='flex flex-wrap items-center'>
          {/* Stats Section */}
          <div className='w-full md:w-1/2 lg:w-2/3 mb-8 md:mb-0'>
            <div className='mb-14'>
              <h2 className='text-xl lg:text-2xl font-bold mb-4 text-[#222]'>
                Βρες τους πιο αξιόλογους επαγγελματίες
              </h2>
              <p className='text-gray-700 leading-relaxed'>
                Η Doulitsa επιβραβεύει και ξεχωρίζει τους καλύτερους
                επαγγελματίες, γιατί θέλουμε να μένουν όλοι ικανοποιημένοι.
              </p>
            </div>

            <div className='flex flex-wrap'>
              <div className='w-full sm:w-1/2 lg:w-1/3 mb-6'>
                <StatItem
                  value='4.9/5'
                  description='Οι top επαγγελματίες έχουν λάβει τις καλύτερες αξιολογήσεις'
                />
              </div>

              <div className='w-full sm:w-1/2 lg:w-1/3 mb-6'>
                <StatItem
                  value='99'
                  suffix='% εγγύηση'
                  description='Επιβεβαιώνουμε ότι οι επαγγελματίες είναι πραγματικοί, ώστε να μην πέσετε θύμα εξαπάτησης'
                />
              </div>

              <div className='w-full sm:w-1/2 lg:w-1/3 mb-6'>
                <div className='transition-all duration-400 ease-in-out'>
                  <div className='mb-4'>
                    <h3 className='text-[#222] font-bold text-2xl leading-[40px] mb-2'>
                      Μας προτείνουν
                    </h3>
                    <p className='mb-0 text-sm leading-relaxed'>
                      Έχουμε συνεργασίες με εταιρείες, οι οποίες μας επιλέγουν
                      από τον 1ο χρόνο λειτουργίας μας.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Testimonials Carousel Section */}
          <div className='w-full md:w-1/2 lg:w-1/3'>
            <div className='mb-[15px]'>
              <Carousel className='w-full'>
                <CarouselContent>
                  {testimonialsItems.map((testimonial, index) => (
                    <CarouselItem key={index}>
                      <TestimonialCard testimonial={testimonial} />
                    </CarouselItem>
                  ))}
                </CarouselContent>

                {/* Navigation */}
                <div className='flex flex-wrap justify-center mt-4'>
                  <div className='w-auto'>
                    <CarouselPrevious className='static translate-y-0 bg-transparent border-0 text-[#222] hover:bg-gray-100'>
                      <ChevronLeft size={20} />
                    </CarouselPrevious>
                  </div>
                  <div className='w-auto flex-1'>
                    <div className='text-center'></div>
                  </div>
                  <div className='w-auto'>
                    <CarouselNext className='static translate-y-0 bg-transparent border-0 text-[#222] hover:bg-gray-100'>
                      <ChevronRight size={20} />
                    </CarouselNext>
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
