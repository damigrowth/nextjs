import React from 'react';
import type { ProfileMetricsProps } from '@/lib/types/components';
import IconBox from '@/components/shared/icon-box';
import { FlaticonCategory } from '@/components/icon';
import { Badge } from '../ui/badge';
import ProfileSubdivisionsWrapper from './profile-subdivisions-wrapper';

/**
 * Modern ProfileMetrics Component
 * Displays key metrics about the profile (category, service subdivisions)
 */

export default function ProfileMetrics({
  category,
  subcategory,
  serviceSubdivisions,
}: ProfileMetricsProps) {
  const hasAnyMetric =
    category ||
    subcategory ||
    (serviceSubdivisions && serviceSubdivisions.length > 0);

  if (!hasAnyMetric) {
    return null;
  }

  return (
    <section className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6'>
      {/* Subcategory with category below */}
      {(category || subcategory) && (
        <div>
          <IconBox
            icon={<FlaticonCategory size={40} className='h-10 w-10' />}
            title={subcategory?.label}
            value={category?.label}
          />
        </div>
      )}

      {/* Service Subdivisions with category-specific icon */}
      {serviceSubdivisions && serviceSubdivisions.length > 0 && (
        <ProfileSubdivisionsWrapper>
          <IconBox
            showIcon={false}
            title='Υπηρεσίες'
            titleClassName='mb-3'
            value={
              <div className='flex flex-wrap gap-1.5'>
                {serviceSubdivisions
                  .filter((subdivision) => subdivision && subdivision.label)
                  .map((subdivision) => (
                    <Badge
                      key={subdivision.id}
                      variant='outline'
                      className='inline-block text-2sm font-medium py-1 px-2.5 text-center bg-muted text-muted-foreground border-none rounded-xl cursor-pointer'
                    >
                      {subdivision.label}
                    </Badge>
                  ))}
              </div>
            }
          />
        </ProfileSubdivisionsWrapper>
      )}
    </section>
  );
}
