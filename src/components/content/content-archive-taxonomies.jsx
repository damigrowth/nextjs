import React from 'react';

import TaxonomiesGrid from '../parts/taxonomies-grid';
import TaxonomiesSwiper from '../parts/taxonomies-swiper';

/**
 * Renders an archive section for taxonomies, displaying either categories or subcategories
 * in a grid and optionally subdivisions in a swiper.
 *
 * @param {Object} props - The component props.
 * @param {Object} props.archive - The archive data containing categories, subcategories, and subdivisions.
 * @param {Array<Object>} [props.archive.categories] - List of categories for the main categories page.
 * @param {Object} [props.archive.subcategories] - Object containing subcategories data.
 * @param {Array<Object>} [props.archive.subcategories.data] - Array of subcategory objects.
 * @param {Object} [props.archive.subdivisions] - Object containing subdivisions data.
 * @param {Array<Object>} [props.archive.subdivisions.data] - Array of subdivision objects.
 * @returns {JSX.Element} The TaxonomiesArchive component.
 */
export default function TaxonomiesArchive({ archive }) {
  const subcategoriesData = archive?.subcategories?.data || [];
  const subdivisionsData = archive?.subdivisions?.data || [];
  const categoriesData = archive?.categories || [];

  const isMainCategoriesPage =
    categoriesData.length > 0 && subcategoriesData.length === 0;

  let formattedTaxonomies = [];
  let formattedSubdivisions = [];

  if (isMainCategoriesPage) {
    formattedTaxonomies = categoriesData;
  } else {
    formattedTaxonomies = subcategoriesData.map((item) => ({
      ...item.attributes,
      image: item.attributes.image,
      subdivisions: {
        data: item.attributes.subdivisions.data,
      },
    }));
  }

  if (subdivisionsData.length > 0) {
    formattedSubdivisions = subdivisionsData.map((item) => ({
      ...item.attributes,
      subcategory: {
        data: {
          attributes: {
            slug: item.attributes.subcategory.data.attributes.slug,
          },
        },
      },
    }));
  }

  return (
    <div className='taxonomies-archive'>
      {formattedSubdivisions.length > 0 && (
        <TaxonomiesSwiper taxonomies={formattedSubdivisions} />
      )}
      {formattedTaxonomies.length > 0 && (
        <TaxonomiesGrid
          taxonomies={formattedTaxonomies}
          isMainCategoriesPage={isMainCategoriesPage}
        />
      )}
    </div>
  );
}
