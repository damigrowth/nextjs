'use client';

import React from 'react';
import LinkNP from '@/components/link';
import { usePathname } from 'next/navigation';

import { getPathname } from '@/utils/paths';

/**
 * Renders a tab navigation component for different categories or types of listings.
 * It dynamically generates links based on the current path and provided categories.
 *
 * @param {Object} props - The component props.
 * @param {Array<Object>} props.categories - An array of category objects, each with `attributes.slug`, `attributes.label`, and `attributes.plural`.
 * @param {boolean} [props.plural] - If true, uses the `plural` attribute for category labels if available.
 * @param {string} [props.freelancerCategory] - The slug of the currently active freelancer category, if applicable.
 * @param {string} [props.serviceCategory] - The slug of the currently active service category, if applicable.
 * @param {boolean} [props.categoriesRoute] - If true, forces category links to start with '/categories/'.
 * @param {string} props.type - The type of listing (e.g., 'categories', 'freelancer', 'company', 'user', 'service') to determine parent path and label.
 * @returns {JSX.Element} The Tabs component.
 */
export default function Tabs({
  categories,
  plural,
  freelancerCategory,
  serviceCategory,
  categoriesRoute,
  type,
}) {
  const pathName = usePathname();

  const category = getPathname(pathName, 1);

  let parentLabel = 'Όλες οι κατηγορίες';
  let parentPath = 'categories';

  switch (type) {
    case 'freelancer':
      parentLabel = 'Όλοι οι Επαγγελματίες';
      parentPath = 'pros';
      break;
    case 'company':
      parentLabel = 'Όλες οι Επιχειρήσεις';
      parentPath = 'companies';
      break;
    case 'user':
      parentLabel = 'Όλες οι Κατηγορίες';
      parentPath = 'categories';
      break;
    case 'service':
      parentLabel = 'Όλες οι Κατηγορίες';
      parentPath = 'ipiresies';
      break;
    default:
      parentLabel = 'Όλες οι Κατηγορίες';
      parentPath = 'categories';
      break;
  }

  return (
    <section className='categories_list_section overflow-hidden'>
      <div className='container'>
        <div className='row'>
          <div className='col-lg-12'>
            <div className='listings_category_nav_list_menu'>
              <ul className='mb0 d-flex ps-0'>
                <li>
                  <LinkNP
                    href={`/${categoriesRoute ? 'categories' : parentPath}`}
                    className={!category ? 'active' : ''}
                  >
                    {parentLabel}
                  </LinkNP>
                </li>
                {categories.map((cat, index) => (
                  <li key={index}>
                    <LinkNP
                      href={`/${categoriesRoute ? 'categories' : parentPath}/${
                        cat.attributes.slug
                      }`}
                      className={
                        category === cat.attributes.slug ||
                        freelancerCategory === cat.attributes.slug ||
                        serviceCategory === cat.attributes.slug
                          ? 'active'
                          : ''
                      }
                    >
                      {plural ? cat.attributes.plural : cat.attributes.label}
                    </LinkNP>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
