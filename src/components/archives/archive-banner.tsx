'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';
import { getOptimizedImageUrl, buildCloudinaryUrl, extractPublicId } from '@/lib/utils/cloudinary';

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
  // Generate optimized decorative image URLs with exact dimensions
  const leftTopUrl = (() => {
    const url = 'https://res.cloudinary.com/ddejhvzbf/image/upload/v1750071394/Static/left-top_dnznwz.webp';
    const publicId = extractPublicId(url);
    return publicId
      ? buildCloudinaryUrl(publicId, {
          width: 198,
          height: 226,
          crop: 'limit', // Don't crop or upscale, just optimize
          quality: 'auto:good',
          format: 'auto',
          dpr: 'auto',
        })
      : url;
  })();

  const rightBottomUrl = (() => {
    const url = 'https://res.cloudinary.com/ddejhvzbf/image/upload/v1750071395/Static/right-bottom_w0dkoq.webp';
    const publicId = extractPublicId(url);
    return publicId
      ? buildCloudinaryUrl(publicId, {
          width: 255,
          height: 181,
          crop: 'limit', // Don't crop or upscale, just optimize
          quality: 'auto:good',
          format: 'auto',
          dpr: 'auto',
        })
      : url;
  })();

  return (
    <section
      className={cn('py-0 md:py-4 container mx-auto px-4 sm:px-6', className)}
    >
      <div className='cta-service-v1 cta-banner archives-banner rounded-2xl relative overflow-hidden flex items-center bg-white'>
        {/* Left top decorative image */}
        <Image
          alt='vector'
          width={198}
          height={226}
          className='absolute -left-20 -top-20 md:-left-10 md:-top-10 lg:left-0 lg:top-0 z-10'
          src={leftTopUrl}
          priority
        />

        {/* Right bottom decorative image */}
        <Image
          alt='vector'
          width={255}
          height={181}
          className='absolute -right-20 -bottom-20 md:-right-10 md:-bottom-10 lg:right-0 lg:bottom-0 z-10'
          src={rightBottomUrl}
          priority
        />
        <Image
          alt={image?.original_filename || 'Service category'}
          width={320}
          height={180}
          className='absolute rounded-3xl h-45 right-12pc w-80 hidden lg:block z-0 object-cover'
          style={{ right: '12%' }}
          src={
            getOptimizedImageUrl(image, 'card') ||
            'https://res.cloudinary.com/ddejhvzbf/image/upload/v1750071394/Static/vector-service-v1_p6jy69.webp'
          }
          priority
        />
        <div className='relative z-20'>
          <div className='flex justify-between items-center'>
            <div className='max-w-xl my-10 ml-4 sm:ml-12 md:ml-24 lg:ml-36'>
              <h1 className='text-xl sm:text-2xl lg:text-3xl font-bold text-dark mb-2'>
                {title}
              </h1>
              <h2 className='text-sm sm:text-base text-dark font-normal mb-0 leading-relaxed'>
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
