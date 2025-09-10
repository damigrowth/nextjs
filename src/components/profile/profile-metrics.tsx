import React from 'react';
import { FileText, Clock, Briefcase } from 'lucide-react';
import type {
  MetricCardProps,
  ProfileMetricsProps,
} from '@/lib/types/components';

/**
 * Modern ProfileMetrics Component
 * Displays key metrics about the profile (category, services, experience)
 */

function MetricCard({
  icon,
  title,
  value,
  isFullWidth = false,
}: MetricCardProps) {
  return (
    <div
      className={`${isFullWidth ? 'col-span-full sm:col-span-2' : 'col-span-1'}`}
    >
      <div className='flex items-start gap-4'>
        {/* Icon with circular background - matching home categories styling */}
        <div className='flex-shrink-0'>
          <div className='relative inline-block text-2xl text-primary z-10 transition-all duration-300 ease-in-out before:content-[""] before:bg-orangy before:rounded-full before:absolute before:-bottom-1 before:-right-2 before:h-8 before:w-8 before:-z-10 before:transition-all before:duration-300 before:ease-in-out hover:before:bg-sixth'>
            {icon}
          </div>
        </div>
        {/* Content */}
        <div className='flex-1 min-w-0'>
          <h5 className='text-sm font-bold text-foreground mb-1 leading-tight'>
            {title}
          </h5>
          {value && (
            <p className='text-sm text-muted-foreground mb-0'>{value}</p>
          )}
        </div>
      </div>
    </div>
  );
}

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
        <MetricCard
          icon={<FileText className='h-10 w-10' />}
          title={subcategory.label}
          isFullWidth={true}
        />
      )}

      {/* Services Count */}
      {servicesCount && servicesCount > 0 && (
        <MetricCard
          icon={<Briefcase className='h-10 w-10' />}
          title='Υπηρεσίες'
          value={servicesCount}
        />
      )}

      {/* Years of Experience */}
      {commencement && experience && (
        <MetricCard
          icon={<Clock className='h-10 w-10' />}
          title='Έτη Εμπειρίας'
          value={experience}
        />
      )}
    </section>
  );
}
