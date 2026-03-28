import React from 'react';
import NextLink from './next-link';

// Default service categories (used when no items prop is passed)
const SERVICE_CATEGORIES = [
  { id: '1', label: 'Δημιουργία Περιεχομένου', slug: 'dimiourgia-periexomenou', emoji: '🎥' },
  { id: '2', label: 'Εκδηλώσεις', slug: 'ekdiloseis', emoji: '🎶' },
  { id: '3', label: 'Ευεξία & Φροντίδα', slug: 'eveksia-frontida', emoji: '💖' },
  { id: '4', label: 'Μαθήματα', slug: 'mathimata', emoji: '🎓' },
  { id: '5', label: 'Μάρκετινγκ', slug: 'marketing', emoji: '🎯' },
  { id: '6', label: 'Πληροφορική', slug: 'pliroforiki', emoji: '💻' },
  { id: '7', label: 'Τεχνικά', slug: 'texnika', emoji: '🪛' },
  { id: '8', label: 'Υποστήριξη', slug: 'ypostiriksi', emoji: '🤝' },
];

interface TaxonomyTabItem {
  label: string;
  slug: string;
  emoji?: string;
}

interface TaxonomyTabsProps {
  /** Category items to display. Defaults to SERVICE_CATEGORIES. */
  items?: TaxonomyTabItem[];
  /** Base path for category links. Defaults to '/categories'. */
  basePath?: string;
  /** Label for the "all" tab. Defaults to 'Όλες οι Κατηγορίες'. */
  allItemsLabel?: string;
  /** Href for the "all" tab. Defaults to basePath. */
  allItemsHref?: string;
  /** Currently active category slug. */
  activeItemSlug?: string;
  className?: string;
}

/**
 * Reusable horizontal taxonomy/category navigation tabs.
 * Works for service categories, blog categories, or any taxonomy.
 */
export default function TaxonomyTabs({
  items,
  basePath = '/categories',
  allItemsLabel = 'Όλες οι Κατηγορίες',
  allItemsHref,
  activeItemSlug,
  className = '',
}: TaxonomyTabsProps) {
  const categories = items || SERVICE_CATEGORIES;
  const allHref = allItemsHref || basePath;

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
                    href={allHref}
                    className={`inline-block px-4 py-2 text-body hover:text-primary transition-colors text-sm whitespace-nowrap ${
                      !activeItemSlug ? 'text-primary font-medium' : ''
                    }`}
                  >
                    {allItemsLabel}
                  </NextLink>
                </li>

                {/* Category links */}
                {categories.map((category) => (
                  <li key={category.slug} className='flex-shrink-0'>
                    <NextLink
                      href={`${basePath}/${category.slug}`}
                      className={`inline-block px-4 py-2 text-body hover:text-primary transition-colors text-sm whitespace-nowrap ${
                        activeItemSlug === category.slug ? 'text-primary font-medium' : ''
                      }`}
                    >
                      {category.emoji && <span className='mr-1'>{category.emoji}</span>}
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
