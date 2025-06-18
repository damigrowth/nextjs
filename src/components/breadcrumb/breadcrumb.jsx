import React from 'react';
import LinkNP from '@/components/link';

import BreadcrumbButtons from './breadcrumb-buttons';

/**
 * Renders a dynamic breadcrumb navigation for archive pages.
 * It supports up to three levels: parent, category, subcategory, and subdivision.
 * It also includes an optional section for action buttons (e.g., save/share) if `subjectTitle` is provided.
 *
 * @param {Object} props - The component props.
 * @param {string} props.parentPathLabel - The display label for the parent path (e.g., 'Υπηρεσίες').
 * @param {string} props.parentPathLink - The URL segment for the parent path (e.g., 'categories').
 * @param {Object} [props.category] - The category object, containing `slug`, `label`, and `plural` (optional).
 * @param {Object} [props.subcategory] - The subcategory object, containing `slug`, `label`, and `plural` (optional).
 * @param {Object} [props.subdivision] - The subdivision object, containing `slug`, `label`, and `plural` (optional).
 * @param {boolean} [props.plural] - If true, uses the `plural` attribute for labels if available.
 * @param {boolean} [props.categoriesRoute] - If true, forces category links to start with '/categories/'.
 * @param {string} [props.subjectTitle] - The title of the subject (e.g., service title) for the action buttons.
 * @param {string} [props.id] - The ID of the subject for the action buttons.
 * @param {boolean} [props.savedStatus] - The saved status of the subject for the action buttons.
 * @param {boolean} [props.isAuthenticated] - Authentication status for the action buttons.
 * @returns {JSX.Element} The BreadcrumbArchives component.
 */
export default async function BreadcrumbArchives({
  parentPathLabel,
  parentPathLink,
  category,
  subcategory,
  subdivision,
  plural,
  categoriesRoute,
  subjectTitle,
  id,
  savedStatus,
  isAuthenticated,
}) {
  return (
    <section className='breadcumb-section'>
      <div className='container'>
        <div className='row'>
          <div className='col-sm-8 col-lg-10'>
            <div className='breadcumb-style1'>
              <div className='breadcumb-list'>
                <LinkNP href='/'>Αρχική</LinkNP>
                <LinkNP href={`/${parentPathLink}`}>{parentPathLabel}</LinkNP>
                {category && (
                  <LinkNP
                    href={`/${categoriesRoute ? 'categories' : parentPathLink}/${category.slug}`}
                  >
                    {plural ? category.plural : category.label}
                  </LinkNP>
                )}
                {subcategory === subdivision ? (
                  <>
                    {subcategory && (
                      <LinkNP
                        href={
                          categoriesRoute
                            ? `/${parentPathLink}/${subcategory.slug}`
                            : `/${parentPathLink}/${category.slug}/${subcategory.slug}`
                        }
                      >
                        {plural ? subcategory.plural : subcategory.label}
                      </LinkNP>
                    )}
                  </>
                ) : (
                  <>
                    {subcategory && (
                      <LinkNP
                        href={
                          categoriesRoute
                            ? `/${parentPathLink}/${subcategory.slug}`
                            : `/${parentPathLink}/${category.slug}/${subcategory.slug}`
                        }
                      >
                        {plural ? subcategory.plural : subcategory.label}
                      </LinkNP>
                    )}
                    {subcategory && subdivision && (
                      <LinkNP
                        href={
                          categoriesRoute
                            ? `/${parentPathLink}/${subcategory.slug}/${subdivision.slug}`
                            : `/${parentPathLink}/${category.slug}/${subcategory.slug}`
                        }
                        className='archive-breadcrump-active'
                      >
                        {plural ? subdivision.plural : subdivision.label}
                      </LinkNP>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
          {subjectTitle && (
            <div className='col-sm-4 col-lg-2'>
              <div className='d-flex align-items-center justify-content-sm-end'>
                <BreadcrumbButtons
                  subjectTitle={subjectTitle}
                  id={id}
                  savedStatus={savedStatus}
                  saveType={'service'}
                  isAuthenticated={isAuthenticated}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
