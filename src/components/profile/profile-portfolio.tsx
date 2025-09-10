import React from 'react';
import MediaCarousel from '../shared/media-carousel';
import type { CloudinaryResource } from '@/lib/types/cloudinary';

type ProfilePortfolioProps = {
  portfolio?: CloudinaryResource[] | CloudinaryResource | null;
};

export default function ProfilePortfolio({ portfolio }: ProfilePortfolioProps) {
  // Ensure portfolio is always an array
  const portfolioArray = Array.isArray(portfolio)
    ? portfolio
    : portfolio
      ? [portfolio]
      : [];

  // Don't render the section if there's no portfolio
  if (portfolioArray.length === 0) {
    return null;
  }

  return (
    <section className='py-5'>
      <h6 className='font-bold text-foreground mb-5'>Δείγμα Εργασιών</h6>
      <MediaCarousel media={portfolioArray} className='w-full' />
    </section>
  );
}
