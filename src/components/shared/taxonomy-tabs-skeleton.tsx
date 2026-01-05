import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Skeleton loader for TaxonomyTabs component
 * Matches the navigation tabs at the top of pages
 */
export default function TaxonomyTabsSkeleton() {
  return (
    <section className='overflow-hidden bg-muted border-b border-gray-200'>
      <div className='container mx-auto p-2'>
        <div className='flex flex-wrap'>
          <div className='w-full relative overflow-x-clip'>
            <nav className='overflow-x-auto scrollbar-hide'>
              <ul className='mb-0 flex flex-nowrap ps-0'>
                {/* Tab skeletons */}
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((index) => (
                  <li key={index} className='flex-shrink-0 px-4 py-2'>
                    <Skeleton
                      className='h-5 rounded'
                      style={{ width: `${60 + Math.random() * 40}px` }}
                    />
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </section>
  );
}
