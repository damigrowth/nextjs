'use client';

import React, { useState } from 'react';
import { ServiceCard } from '../shared';
import { Button } from '@/components/ui/button';
import type { ServiceCardData } from '@/lib/types';

interface ProfileServicesProps {
  services: ServiceCardData[];
  profileUsername: string;
}

export default function ProfileServices({
  services,
  profileUsername
}: ProfileServicesProps) {
  const [visibleCount, setVisibleCount] = useState(3);

  if (!services || services.length === 0) {
    return null;
  }

  const hasMore = visibleCount < services.length;
  const visibleServices = services.slice(0, visibleCount);

  const handleLoadMore = () => {
    setVisibleCount(prev => Math.min(prev + 3, services.length));
  };

  return (
    <section className='py-5'>
      <h4 className='font-semibold text-lg text-foreground mb-5'>
        Υπηρεσίες ({services.length})
      </h4>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {visibleServices.map((service) => (
          <ServiceCard
            key={service.id}
            service={service}
            showProfile={false}
          />
        ))}
      </div>

      {hasMore && (
        <div className='mt-6 text-center'>
          <Button
            onClick={handleLoadMore}
            variant='outline'
            size='lg'
          >
            Περισσότερες Υπηρεσίες
          </Button>
        </div>
      )}
    </section>
  );
}