import React from 'react';
import Link from 'next/link';

import BreadcrumbButtons from './breadcrumb-buttons';

export default function ProfileBreadcrumb({
  category,
  subcategory,
  type,
  subjectTitle,
  id,
  savedStatus,
  hideSaveButton,
  isAuthenticated,
}) {
  const parentSlug = type === 'company' ? 'companies' : 'pros';

  return (
    <section className='breadcumb-section bg-white'>
      <div className='container'>
        <div className='row'>
          <div className='col-sm-8 col-lg-10'>
            <div className='breadcumb-style1 mb10-xs'>
              <div className='breadcumb-list'>
                <Link href='/'>Αρχική</Link>
                {type === 'company' ? (
                  <Link href='/companies'>
                    <span className='heading-p-gray'>Επιχειρήσεις</span>
                  </Link>
                ) : (
                  <Link href={`/${parentSlug}`}>
                    <span className='heading-p-gray'>Επαγγελματίες</span>
                  </Link>
                )}
                {category?.data?.attributes && (
                  <Link
                    href={`/${parentSlug}/${category.data.attributes.slug}`}
                  >
                    <span className='heading-p-gray'>
                      {category.data.attributes.plural}
                    </span>
                  </Link>
                )}
                {subcategory?.data?.attributes && (
                  <Link
                    href={`/${parentSlug}/${category.data.attributes.slug}/${subcategory.data.attributes.slug}`}
                  >
                    <span className='heading-p'>
                      {subcategory.data.attributes.plural}
                    </span>
                  </Link>
                )}
              </div>
            </div>
          </div>
          <div className='col-sm-4 col-lg-2'>
            <div className='d-flex align-items-center justify-content-sm-end'>
              <BreadcrumbButtons
                subjectTitle={subjectTitle}
                id={id}
                savedStatus={savedStatus}
                saveType={'freelancer'}
                hideSaveButton={hideSaveButton}
                isAuthenticated={isAuthenticated}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
