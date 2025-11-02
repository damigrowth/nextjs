import React from 'react';
import LinkNP from '@/components/link';
import { TaxonomyTabsProps } from '@/lib/types';

/**
 * Universal tab navigation component for any collection
 * Completely generic and reusable across different data types
 */

export default function TaxonomyTabs({
  items,
  basePath,
  allItemsLabel,
  allItemsHref,
  activeItemSlug,
  usePluralLabels = false,
  className = '',
}: TaxonomyTabsProps) {
  return (
    <section className={`overflow-hidden bg-muted border-b border-gray-200 shadow-sm ${className}`}>
      <div className='container mx-auto p-2'>
        <div className='flex flex-wrap'>
          <div className='w-full relative'>
            <nav className='overflow-x-auto scrollbar-hide'>
              <ul className='mb-0 flex flex-nowrap ps-0'>
                {/* All items link */}
                <li className='flex-shrink-0'>
                  <LinkNP
                    href={allItemsHref || `/${basePath}`}
                    className={`inline-block px-4 py-2 text-body hover:text-primary transition-colors text-sm whitespace-nowrap ${
                      !activeItemSlug ? 'text-primary font-medium' : ''
                    }`}
                  >
                    {allItemsLabel}
                  </LinkNP>
                </li>

                {/* Individual item links */}
                {items.map((item) => {
                  const isActive = activeItemSlug === item.slug;
                  const displayLabel =
                    usePluralLabels && item.plural ? item.plural : item.label;

                  return (
                    <li key={item.id} className='flex-shrink-0'>
                      <LinkNP
                        href={`/${basePath}/${item.slug}`}
                        className={`inline-block px-4 py-2 text-body hover:text-primary transition-colors text-sm whitespace-nowrap ${
                          isActive ? 'text-primary font-medium' : ''
                        }`}
                      >
                        {displayLabel}
                      </LinkNP>
                    </li>
                  );
                })}
              </ul>
            </nav>
            {/* Fade overlay on right edge */}
            <div className='absolute top-0 right-0 bottom-0 w-16 bg-gradient-to-l from-muted to-transparent pointer-events-none' />
          </div>
        </div>
      </div>
    </section>
  );
}
