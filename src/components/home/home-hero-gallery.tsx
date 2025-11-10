'use client';

import React from 'react';
import Image from 'next/image';
import Autoplay from 'embla-carousel-autoplay';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';

// Hero Image Gallery Component - Lazy loaded for better performance
export default function HeroImageGallery() {
  const galleryImages = [
    {
      src: 'https://plus.unsplash.com/premium_photo-1681505210563-eeb5d84fcaad?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=772',
      alt: 'Υπηρεσίες 1',
    },
    {
      src: 'https://plus.unsplash.com/premium_photo-1664301548366-f5402468cef2?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=774',
      alt: 'Υπηρεσίες 2',
    },
    {
      src: 'https://images.unsplash.com/photo-1549981832-2ba2ee913334?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=774',
      alt: 'Υπηρεσίες 3',
    },
    {
      src: 'https://plus.unsplash.com/premium_photo-1664280284972-b0af7e35605f?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=776',
      alt: 'Υπηρεσίες 4',
    },
    {
      src: 'https://plus.unsplash.com/premium_photo-1706825702836-bcf602e00751?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=928',
      alt: 'Υπηρεσίες 5',
    },
    {
      src: 'https://images.unsplash.com/photo-1742483359033-13315b247c74?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=776',
      alt: 'Υπηρεσίες 6',
    },
    {
      src: 'https://images.unsplash.com/photo-1604881991720-f91add269bed?q=80&w=1600&auto=format&fit=crop',
      alt: 'Υπηρεσίες 7',
    },
    {
      src: 'https://images.unsplash.com/photo-1610462534044-5349e2261b86?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=774',
      alt: 'Υπηρεσίες 8',
    },
    {
      src: 'https://images.unsplash.com/photo-1589710751893-f9a6770ad71b?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=774',
      alt: 'Υπηρεσίες 9',
    },
  ];

  const pluginRef = React.useRef(
    Autoplay({ delay: 3000, stopOnInteraction: false }),
  );

  return (
    <div className='w-full max-w-3xl lg:max-w-4xl mt-6 md:mt-10'>
      <Carousel
        plugins={[pluginRef.current]}
        opts={{
          align: 'start',
          loop: true,
          slidesToScroll: 1,
        }}
        onMouseEnter={() => pluginRef.current.stop()}
        onMouseLeave={() => pluginRef.current.play()}
        className='w-full'
      >
        <CarouselContent className='py-2 pb-4'>
          {galleryImages.map((image, index) => (
            <CarouselItem
              key={index}
              className='basis-1/2 sm:basis-1/2 md:basis-1/3 lg:basis-1/5'
            >
              <div className='relative w-full aspect-[3/4] rounded-2xl overflow-hidden shadow-lg'>
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  className='object-cover'
                  sizes='(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw'
                  loading={index < 5 ? 'eager' : 'lazy'}
                  priority={index < 5}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
}
