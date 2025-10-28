import React from 'react';
import { FileText } from 'lucide-react';
import type { ProfileMetricsProps } from '@/lib/types/components';
import IconBox from '@/components/shared/icon-box';
import { FlaticonCategory } from '@/components/icon';
import { Badge } from '@/components/ui/badge';
import { getCategoryIcon } from '@/constants/datasets/category-icons';

/**
 * Modern ProfileMetrics Component
 * Displays key metrics about the profile (category, service subdivisions)
 */

export default function ProfileMetrics({
  subcategory,
  serviceSubdivisions,
  categoryIcon,
}: ProfileMetricsProps) {
  const hasAnyMetric =
    subcategory || (serviceSubdivisions && serviceSubdivisions.length > 0);

  if (!hasAnyMetric) {
    return null;
  }

  // Get the category icon component, fallback to FileText
  const CategoryIconComponent = categoryIcon
    ? getCategoryIcon(categoryIcon)
    : undefined;

  const SubcategoryIcon = CategoryIconComponent || FileText;

  return (
    <section className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6'>
      {/* Subcategory with category icon */}
      {subcategory && (
        <div>
          <IconBox
            icon={<SubcategoryIcon className='h-10 w-10' />}
            title={subcategory.label}
          />
        </div>
      )}

      {/* Service Subdivisions with category-specific icon */}
      {serviceSubdivisions && serviceSubdivisions.length > 0 && (
        <div className='sm:col-span-2'>
          <IconBox
            icon={<FlaticonCategory size={40} className='h-10 w-10' />}
            title='Υπηρεσίες'
            titleClassName='mb-3'
            value={
              <div className='flex flex-wrap gap-1.5'>
                {serviceSubdivisions.map((subdivision) => (
                  <Badge
                    key={subdivision.id}
                    variant='outline'
                    className='inline-block text-2sm font-medium py-1 px-2.5 text-center bg-muted text-muted-foreground border-none rounded-xl'
                  >
                    {subdivision.label}
                  </Badge>
                ))}
              </div>
            }
          />
        </div>
      )}
    </section>
  );
}
