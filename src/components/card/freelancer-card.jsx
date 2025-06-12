import React from 'react';
import Link from 'next/link';

import { UserImage } from '@/components/avatar';
import { formatRating } from '@/utils/formatRating';

import { VerifiedBadge } from '../badge';
import SaveForm from '../form/form-save';
import { getSavedStatus } from '@/actions/shared/save';
import { ArrowRightLong } from '@/components/icon/fa';
import { IconStar } from '@/components/icon/fa';

export default async function FreelancerCard({
  freelancer,
  fid,
  linkedName,
  showDelete,
}) {
  const {
    id,
    username,
    firstName,
    lastName,
    displayName,
    image,
    verified,
    rating,
    reviews_total,
    topLevel,
    specialization,
    category,
    subcategory,
  } = freelancer;

  let savedStatus = null;

  let showSaveButton = false;

  // if user is logged in and is not the same user, show save button
  if (fid && fid !== id) {
    showSaveButton = true;
    savedStatus = await getSavedStatus('freelancer', id);
  }

  return (
    <>
      <div className='data-loading-element freelancer-style1 text-center bdr1 hover-box-shadow posiiton-relative w-100'>
        {showSaveButton && (
          <SaveForm
            type='freelancer'
            id={id}
            initialSavedStatus={savedStatus}
            showDelete={showDelete}
            isAuthenticated={fid ? true : false}
          />
        )}
        <div className='thumb w90 mb25 mx-auto position-relative rounded-circle'>
          <UserImage
            height={90}
            width={90}
            image={image?.data?.attributes?.formats?.thumbnail?.url}
            alt='user-image'
            firstName={firstName}
            lastName={lastName}
            displayName={displayName}
            bigText
            path={`/profile/${username}`}
            topLevel={topLevel}
            hideDisplayName
          />
        </div>
        <div className='review'>
          {linkedName ? (
            <Link
              href={`/profile/${username}`}
              className='d-flex align-items-center justify-content-center mb-1'
            >
              <h5 className='title m0 mr5 text-bold'>{displayName}</h5>
              <VerifiedBadge verified={verified} />
            </Link>
          ) : (
            <div className='d-flex align-items-center justify-content-center mb-1'>
              <h5 className='title m0 mr5 text-bold'>{displayName}</h5>
              <VerifiedBadge verified={verified} />
            </div>
          )}
          <p className='mb-0 text-bold'>
            {subcategory?.data
              ? subcategory?.data?.attributes?.label
              : category?.data?.attributes?.label || '\u00A0'}
          </p>
          {reviews_total > 0 ? (
            <p className='mb-0 fz14 list-inline-item '>
              <IconStar className='vam fz10 review-color mb5' />{' '}
              <span className='dark-color fw500'>{formatRating(rating)}</span>
              <span className='ml5 review-count-text'>
                {reviews_total === 1
                  ? `(${reviews_total} αξιολόγηση)`
                  : `(${reviews_total} αξιολογήσεις)`}
              </span>
            </p>
          ) : (
            <div className='empty-card-reviews'>&nbsp;</div>
          )}
          {specialization?.data ? (
            <div className='card-tags'>
              <span className='card-tag'>
                {specialization.data.attributes.label}
              </span>
            </div>
          ) : (
            <div className='empty-card-tags'>&nbsp;</div>
          )}
          <div className='d-grid mt15'>
            <Link
              href={`/profile/${username}`}
              className='ud-btn btn-light-thm'
            >
              Περισσότερα
              <ArrowRightLong />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
