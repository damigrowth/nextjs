import React from 'react';
import NextLink from './next-link';

// Static service categories for navbar - links to /categories/{slug}
const SERVICE_CATEGORIES = [
  { id: '1', label: 'Δημιουργία Περιεχομένου', slug: 'dimiourgia-periexomenou' },
  { id: '2', label: 'Εκδηλώσεις', slug: 'ekdiloseis' },
  { id: '3', label: 'Ευεξία & Φροντίδα', slug: 'eveksia-frontida' },
  { id: '4', label: 'Μαθήματα', slug: 'mathimata' },
  { id: '5', label: 'Μάρκετινγκ', slug: 'marketing' },
  { id: '6', label: 'Πληροφορική', slug: 'pliroforiki' },
  { id: '7', label: 'Τεχνικά', slug: 'texnika' },
  { id: '8', label: 'Υποστήριξη', slug: 'ypostiriksi' },
];

interface TaxonomyTabsProps {
  activeItemSlug?: string;
  className?: string;
}

/**
 * Static navbar with service categories linking to /categories/{slug}
 */
export default function TaxonomyTabs({
  activeItemSlug,
  className = '',
}: TaxonomyTabsProps) {
  return (
    <section className={`overflow-hidden bg-muted border-b border-gray-200 ${className}`}>
      <div className='container mx-auto p-2'>
        <div className='flex flex-wrap'>
          <div className='w-full relative overflow-x-clip'>
            <nav className='overflow-x-auto scrollbar-hide'>
              <ul className='mb-0 flex flex-nowrap ps-0'>
                {/* All categories link */}
                <li className='flex-shrink-0'>
                  <NextLink
                    href='/categories'
                    className={`inline-block px-4 py-2 text-body hover:text-primary transition-colors text-sm whitespace-nowrap ${
                      !activeItemSlug ? 'text-primary font-medium' : ''
                    }`}
                  >
                    Όλες οι Κατηγορίες
                  </NextLink>
                </li>

                {/* Category links */}
                {SERVICE_CATEGORIES.map((category) => (
                  <li key={category.id} className='flex-shrink-0'>
                    <NextLink
                      href={`/categories/${category.slug}`}
                      className={`inline-block px-4 py-2 text-body hover:text-primary transition-colors text-sm whitespace-nowrap ${
                        activeItemSlug === category.slug ? 'text-primary font-medium' : ''
                      }`}
                    >
                      {category.label}
                    </NextLink>
                  </li>
                ))}
              </ul>
            </nav>
            {/* Fade overlay on right edge */}
            <div className='absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-muted via-muted/60 to-transparent pointer-events-none' />
          </div>
        </div>
      </div>
    </section>
  );
}
