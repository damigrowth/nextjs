import React from 'react';
import LinkNP from '@/components/link';

import { UserImage } from '@/components/avatar';

import { Badges } from '../badge';
import SaveForm from '../form/form-save';
import CardReviews from './card-reviews';
import ServiceCardFile from './card-service-file';
import ServiceCardFiles from './card-service-files';
import { getImage } from '@/utils/image';

export default async function ServiceCard({
  service,
  fid,
  savedStatus = null,
}) {
  const {
    title,
    price,
    slug,
    category,
    subcategory,
    subdivision,
    media,
    freelancer,
  } = service.attributes;

  if (!freelancer.data) {
    return null;
  }
  if (!slug) {
    return null;
  }

  const freelancerData = freelancer.data.attributes;

  const {
    firstName,
    lastName,
    displayName,
    image: avatar,
    username,
    verified,
    topLevel,
    rating,
    reviews_total,
  } = freelancerData;

  let saveStatus = savedStatus;

  // Use the new utility to get subdivision image with fallback
  const subdivisionImageUrl = getImage(
    subdivision?.data?.attributes?.image,
    { size: 'medium' }
  );

  const fallbackImage = subdivisionImageUrl;

  // Note: savedStatus is now passed as prop, no need to fetch

  return (
    <div className='data-loading-element listing-style1 list-style d-block d-xl-flex align-items-center'>
      <div className='arc-service-card-image-wrapper'>
        {media.data.length > 1 ? (
          <ServiceCardFiles
            media={media?.data?.map((item) => item.attributes)}
            path={`/s/${slug}`}
          />
        ) : (
          <ServiceCardFile
            file={media?.data[0]?.attributes}
            path={`/s/${slug}`}
            fallback={fallbackImage}
          />
        )}
      </div>
      <div className='list-content flex-grow-1 ms-1 bgc-white'>
        <SaveForm
          type='service'
          initialSavedStatus={saveStatus}
          id={service.id}
          isAuthenticated={fid ? true : false}
        />
        <div className='archive-service-card-meta'>
          <div>
            <h5 className='list-title'>
              <LinkNP href={`/s/${slug}`}>{title}</LinkNP>
            </h5>
            <p className='list-text body-color fz14 mb-1'>
              {category?.data?.attributes?.label}{' '}
              {subcategory?.data &&
                ' - ' + subcategory?.data?.attributes?.label}
            </p>
          </div>
          <CardReviews rating={rating} reviews_total={reviews_total} />
        </div>
        <hr className='my-2' />
        <div className='list-meta d-flex justify-content-between align-items-center mt15'>
          <div className='archive-service-card-user-meta'>
            <UserImage
              firstName={firstName}
              lastName={lastName}
              displayName={displayName}
              image={getImage(avatar, { size: 'avatar' })}
              alt={avatar?.formats?.thumbnail?.provider_metadata?.public_id}
              width={30}
              height={30}
              path={`/profile/${username}`}
            />
            <Badges verified={verified} topLevel={topLevel} />
          </div>
          {price > 0 && (
            <div className='budget'>
              <p className='mb-0 body-color'>
                από
                <span className='fz17 fw500 dark-color ms-1'>{price}€</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
