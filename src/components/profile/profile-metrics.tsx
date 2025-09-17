import React from 'react';
import { FileText, Clock, Briefcase } from 'lucide-react';
import type { ProfileMetricsProps } from '@/lib/types/components';
import IconBox from '@/components/shared/icon-box';

/**
 * Modern ProfileMetrics Component
 * Displays key metrics about the profile (category, services, experience)
 */

export default function ProfileMetrics({
  subcategory,
  servicesCount,
  commencement,
  experience,
}: ProfileMetricsProps) {
  const hasAnyMetric =
    subcategory || servicesCount || (commencement && experience);

  if (!hasAnyMetric) {
    return null;
  }

  return (
    <section className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6'>
      {/* Subcategory - spans full width on small screens, 2 cols on larger screens */}
      {subcategory && (
        <div>
          <IconBox
            icon={<FileText className='h-10 w-10' />}
            title={subcategory.label}
          />
        </div>
      )}

      {/* Services Count */}
      {servicesCount > 0 && (
        <div>
          <IconBox
            icon={<Briefcase className='h-10 w-10' />}
            title='Υπηρεσίες'
            value={servicesCount}
          />
        </div>
      )}

      {/* Years of Experience */}
      {commencement && experience && (
        <div>
          <IconBox
            icon={<Clock className='h-10 w-10' />}
            title='Έτη Εμπειρίας'
            value={experience}
          />
        </div>
      )}
    </section>
  );
}
