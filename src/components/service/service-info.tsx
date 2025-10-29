import React from 'react';
import { Clock, MapPin, Globe, Users, Briefcase } from 'lucide-react';
import { DatasetItem } from '@/lib/types/datasets';
import IconBox from '@/components/shared/icon-box';
import { FlaticonCategory } from '@/components/icon';

interface ServiceInfoProps {
  coverage: ReturnType<
    typeof import('@/lib/utils/datasets').transformCoverageWithLocationNames
  >;
  category?: DatasetItem;
  subcategory?: DatasetItem;
  subdivision?: DatasetItem;
  duration?: number;
  type?: PrismaJson.ServiceType;
  subscriptionType?: string;
  className?: string;
}

export default function ServiceInfo({
  coverage,
  category,
  subcategory,
  subdivision,
  duration,
  type,
  subscriptionType,
  className = '',
}: ServiceInfoProps) {
  const { online, onbase, onsite, presence, oneoff, subscription } = type || {};

  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 ${className}`}
    >
      {category && (
        <div className='sm:col-span-1 md:col-span-1'>
          <IconBox
            icon={<FlaticonCategory size={40} />}
            title={subdivision?.label || ''}
            value={
              <h2 className='text-sm font-normal text-muted-foreground mb-0'>
                {subcategory?.label}
              </h2>
            }
          />
        </div>
      )}

      {online && (
        <div className='sm:col-span-1 md:col-span-1'>
          <IconBox
            icon={<Globe className='h-10 w-10' />}
            title='Εξυπηρετεί'
            value={
              <div className='flex items-center gap-2'>
                <span className='w-2 h-2 bg-green-500 rounded-full mt-0.5'></span>
                <span>Online</span>
              </div>
            }
          />
        </div>
      )}

      {online && subscription && subscriptionType && (
        <div className='sm:col-span-1 md:col-span-1'>
          <IconBox
            icon={<Briefcase className='h-10 w-10' />}
            title='Πληρωμή'
            value={
              {
                month: 'Μηνιαία',
                year: 'Ετήσια',
                per_case: 'Κατά περίπτωση',
                per_hour: 'Ανά Ώρα',
                per_session: 'Ανά Συνεδρία',
              }[subscriptionType] || 'Άγνωστο'
            }
          />
        </div>
      )}

      {online && oneoff && duration && (
        <div className='sm:col-span-1 md:col-span-1'>
          <IconBox
            icon={<Clock className='h-10 w-10' />}
            title='Χρόνος Παράδοσης'
            value={
              duration > 1 ? duration + ' ' + 'Μέρες' : duration + ' ' + 'Μέρα'
            }
          />
        </div>
      )}

      {presence && onbase && coverage.onbase && coverage.address && (
        <div className='sm:col-span-2 md:col-span-2'>
          <IconBox
            icon={<MapPin className='h-10 w-10' />}
            title='Διεύθυνση'
            value={coverage.address}
          />
        </div>
      )}

      {presence &&
        onsite &&
        coverage.onsite &&
        ((coverage.counties && coverage.counties.length > 0) ||
          (coverage.areas && coverage.areas.length > 0)) && (
          <div className='sm:col-span-2 md:col-span-2'>
            <IconBox
              icon={<Users className='h-10 w-10' />}
              title='Περιοχές Εξυπηρέτησης'
              value={`${
                coverage.counties && coverage.counties.length > 0
                  ? coverage.counties.join(', ')
                  : ''
              }${
                coverage.counties &&
                coverage.counties.length > 0 &&
                coverage.areas &&
                coverage.areas.length > 0
                  ? ' - '
                  : ''
              }${
                coverage.areas && coverage.areas.length > 0
                  ? coverage.areas.join(', ')
                  : ''
              }`}
            />
          </div>
        )}
    </div>
  );
}
