import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

/**
 * Renders a grid of taxonomies (categories or subcategories).
 * Each item in the grid displays an image, title, and a list of associated subdivisions.
 *
 * @param {Object} props - The component props.
 * @param {Array<Object>} props.taxonomies - An array of taxonomy objects to display. Each object should have `slug`, `label`, `image`, and `subdivisions.data` (an array of subdivision objects with `attributes.slug` and `attributes.label`).
 * @param {boolean} [props.isMainCategoriesPage=false] - A flag indicating if the current page is the main categories archive. This affects the link structure.
 * @returns {JSX.Element} The TaxonomiesGrid component.
 */
export default function TaxonomiesGrid({
  taxonomies,
  isMainCategoriesPage = false,
}) {
  const fallbackImage =
    'https://res.cloudinary.com/ddejhvzbf/image/upload/v1750071394/Static/vector-service-v1_p6jy69.webp';

  return (
    <section className='pt0'>
      <div className='container'>
        <h2 className='mb20'>
          {isMainCategoriesPage ? 'Κατηγορίες' : 'Κατηγορίες'}
        </h2>
        <div className='taxonomies-grid'>
          {taxonomies &&
            taxonomies.map((taxonomy, index) => (
              <div key={index} className='taxonomies-grid-card'>
                <div className='taxonomies-grid-image'>
                  <Image
                    fill
                    src={
                      taxonomy?.image?.data?.attributes?.formats?.small?.url ||
                      fallbackImage
                    }
                    alt='vector'
                  />
                </div>
                <div className='taxonomies-grid-info'>
                  <Link
                    href={
                      isMainCategoriesPage
                        ? `/categories/${taxonomy.slug}`
                        : `/ipiresies/${taxonomy.slug}`
                    }
                  >
                    <h3 className='taxonomies-grid-title'>{taxonomy.label}</h3>
                  </Link>
                  <ul className='taxonomies-grid-list'>
                    {taxonomy.subdivisions.data.map((item, subIndex) => (
                      <li key={subIndex} className='taxonomies-grid-list-item'>
                        <Link
                          href={
                            isMainCategoriesPage
                              ? `/ipiresies/${item.attributes.slug}`
                              : `/ipiresies/${taxonomy.slug}/${item.attributes.slug}`
                          }
                        >
                          {item.attributes.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
        </div>
      </div>
    </section>
  );
}
