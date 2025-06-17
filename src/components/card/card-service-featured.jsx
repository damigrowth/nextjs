import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

import { formatRating } from '@/utils/formatRating';
import { getBestDimensions } from '@/utils/imageDimensions';
import { IconStar } from '@/components/icon/fa';

import UserImage from '../avatar/user-image';
import SaveForm from '../form/form-save';
import VideoPreview from './card-video-preview';

export default async function FeaturedServiceCard({
  service,
  fid,
  showDelete,
  savedStatus = null, // Accept savedStatus prop for consistency (not used in this card)
}) {
  const { id, media, category, subdivision, title, slug, freelancer, price } =
    service;

  const freelancerData = freelancer?.data?.attributes;

  if (!freelancerData) return null;

  const {
    username,
    firstName,
    lastName,
    displayName,
    image: avatar,
    rating,
    reviews_total,
  } = freelancerData;

  const subdivisionImage = getBestDimensions(
    subdivision?.data?.attributes?.image?.data?.attributes?.formats,
  );

  const fallback = subdivisionImage?.url;

  const fallbackImage =
    fallback ||
    'https://res.cloudinary.com/ddejhvzbf/image/upload/v1750076750/Static/service_ngrppj.webp';

  const firstMediaItem = media.data.length > 0 ? media.data[0] : null;

  const firstMediaAttributes = firstMediaItem?.attributes;

  let mediaContent;

  if (firstMediaAttributes?.formats) {
    // It's an image
    const formatResult = getBestDimensions(firstMediaAttributes.formats);

    const imageUrl = formatResult?.url || fallbackImage;

    mediaContent = (
      <Link href={`/s/${slug}`}>
        <Image
          height={247}
          width={331}
          className='w-100'
          src={imageUrl}
          alt={`featured-service-${title}-freelancer-${username}`}
          style={{ objectFit: 'cover', height: '247px' }} // Ensure consistent height
        />
      </Link>
    );
  } else if (firstMediaAttributes?.mime?.startsWith('video/')) {
    // It's a video
    mediaContent = (
      <div style={{ width: '331px', height: '247px' }}>
        {' '}
        {/* Container with dimensions */}
        <VideoPreview
          previewUrl={firstMediaAttributes.previewUrl}
          videoUrl={firstMediaAttributes.url}
          mime={firstMediaAttributes.mime}
        />
      </div>
    );
  } else {
    // Fallback (no media or unknown type) - Render fallback image without link
    mediaContent = (
      <Image
        height={247}
        width={331}
        className='w-100'
        src={fallbackImage}
        alt={`featured-service-${title}-freelancer-${username}`}
        style={{ objectFit: 'cover', height: '247px' }}
      />
    );
  }

  return (
    <div className='listing-style1 bdrs16'>
      <div className='list-thumb'>
        {mediaContent} {/* Render the determined media content */}
        {fid && (
          <SaveForm
            type='service'
            id={id}
            showDelete={showDelete}
            isAuthenticated={fid ? true : false}
          />
        )}
      </div>
      {/* <div className={`list-content ${isContentExpanded ? "px-0" : ""}`}> */}
      <div className='list-content'>
        <p className='list-text body-color fz14 mb-1'>
          {category.data?.attributes?.label}
        </p>
        <h5 className='service-card-title'>
          <Link href={`/s/${slug}`}>
            {title.length > 60 ? `${title.slice(0, 60)}...` : title}
          </Link>
        </h5>
        <div className='review-meta d-flex align-items-center'>
          {reviews_total && (
            <>
              <IconStar className='fz10 review-color me-2' />
              <p className='mb-0 body-color fz14'>
                <span className='dark-color me-2'>{formatRating(rating)}</span>
                {reviews_total > 1
                  ? `(${reviews_total} αξιολογήσεις)`
                  : `(${reviews_total} αξιολόγηση)`}
              </p>
            </>
          )}
        </div>
        <hr className='my-2' />
        <div className='list-meta d-flex justify-content-between align-items-center mt15'>
          <UserImage
            image={avatar?.data?.attributes?.formats?.thumbnail?.url}
            width={30}
            height={30}
            firstName={firstName}
            lastName={lastName}
            displayName={displayName}
            path={`/profile/${username}`}
          />
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
