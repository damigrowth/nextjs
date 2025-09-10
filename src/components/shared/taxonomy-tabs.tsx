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
  activeItemSlug,
  usePluralLabels = false,
  className = '',
}: TaxonomyTabsProps) {
  return (
    <section className={`overflow-hidden bg-muted ${className}`}>
      <div className='container mx-auto py-2'>
        <div className='flex flex-wrap'>
          <div className='w-full'>
            <nav>
              <ul className='mb-0 flex flex-wrap ps-0'>
                {/* All items link */}
                <li>
                  <LinkNP
                    href={`/${basePath}`}
                    className={`inline-block px-4 py-2 text-body hover:text-primary transition-colors text-sm ${
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
                    <li key={item.id}>
                      <LinkNP
                        href={`/${basePath}/${item.slug}`}
                        className={`inline-block px-4 py-2 text-body hover:text-primary transition-colors text-sm ${
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
          </div>
        </div>
      </div>
    </section>
  );
}
