'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';

interface ArchiveBannerProps {
  title: string;
  subtitle: string;
  className?: string;
  image?: {
    secure_url: string;
    original_filename?: string;
  };
}

export function ArchiveBanner({
  title,
  subtitle,
  className,
  image,
}: ArchiveBannerProps) {
  return (
    <section className={cn('py-4 container mx-auto', className)}>
      <div className='cta-service-v1 cta-banner archives-banner rounded-2xl relative overflow-hidden flex items-center mx-4 px-4 bg-white'>
        {/* Left top decorative image */}
        <Image
          alt='vector'
          width={198}
          height={226}
          className='absolute left-0 top-0 z-10'
          src='https://res.cloudinary.com/ddejhvzbf/image/upload/v1750071394/Static/left-top_dnznwz.webp'
          priority
        />

        {/* Right bottom decorative image */}
        <Image
          alt='vector'
          width={255}
          height={181}
          className='absolute right-0 bottom-0 z-10'
          src='https://res.cloudinary.com/ddejhvzbf/image/upload/v1750071395/Static/right-bottom_w0dkoq.webp'
          priority
        />
        <Image
          alt={image?.original_filename || 'Service category'}
          width={320}
          height={180}
          className='absolute rounded-3xl h-45 right-12pc w-80 hidden lg:block z-0 object-cover'
          style={{ right: '12%' }}
          src={
            image?.secure_url ||
            'https://res.cloudinary.com/ddejhvzbf/image/upload/v1750071394/Static/vector-service-v1_p6jy69.webp'
          }
          priority
        />
        <div className='container mx-auto px-4 relative z-20'>
          <div className='flex justify-between items-center'>
            <div className='max-w-xl my-10 ml-36'>
              <h1 className='text-xl lg:text-2xl font-bold text-dark mb-2'>
                {title}
              </h1>
              <h2 className='text-sm text-dark font-normal mb-0 leading-relaxed'>
                {subtitle}
              </h2>
            </div>
            {/* Main service vector - hidden on mobile, visible on large screens */}
          </div>
        </div>
      </div>
    </section>
  );
}
