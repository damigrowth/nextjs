'use client';

import LinkNP from '@/components/link';

import { UserImage } from '@/components/avatar';
import { formatRating } from '@/utils/formatRating';
import { IconStar } from '@/components/icon/fa';
import { getImage } from '@/utils/image';

import SaveForm from '../form/form-save';
import FeaturedServiceSlideCardMedia from './card-service-media-slider';

export default function FeaturedServiceSliderCardClient({
  service,
  fid,
  showDelete,
  savedStatus = null, // Accept savedStatus as prop
}) {
  const { id, media, category, title, slug, freelancer, price } = service;

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

  return (
    <>
      <div className='listing-style1 default-box-shadow1 bdrs16'>
        <div className='list-thumb'>
          {/* Always show save button - let SaveForm handle authentication */}
          <SaveForm
            type='service'
            id={id}
            initialSavedStatus={savedStatus}
            showDelete={showDelete}
            isAuthenticated={fid ? true : false}
          />
          <div className='listing-thumbIn-slider position-relative navi_pagi_bottom_center slider-1-grid'>
            <div className='item'>
              <FeaturedServiceSlideCardMedia
                media={media}
                path={`/s/${slug}`}
              />
            </div>
          </div>
        </div>
        <div className='list-content'>
          <p className='list-text body-color fz14 mb-1'>
            {category?.data?.attributes?.label}
          </p>
          <h5 className='service-card-title'>
            <LinkNP href={`/s/${slug}`}>
              {title.length > 60 ? `${title.slice(0, 60)}...` : title}
            </LinkNP>
          </h5>
          <div className='review-meta d-flex align-items-center'>
            {reviews_total && (
              <>
                <IconStar className='fz10 review-color me-2' />
                <p className='mb-0 body-color fz14'>
                  <span className='dark-color me-2'>
                    {formatRating(rating)}
                  </span>
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
              image={getImage(avatar, { size: 'avatar' })}
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
    </>
  );
}
