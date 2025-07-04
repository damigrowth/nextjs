import React from 'react';
import LinkNP from '@/components/link';

// import ReviewReactions from "./ReviewRe@/actions";
import { UserImage } from '@/components/avatar';
import { formatDate } from '@/utils/formatDate';
import { formatUserRating } from '@/utils/formatRating';

import Rating from './review-rating';
import { getUserId } from '@/actions/shared/user';

export default async function Review({
  reviewId,
  service,
  firstName,
  lastName,
  displayName,
  image,
  date,
  comment,
  likes,
  dislikes,
  rating,
  showReviewsModel,
}) {
  const { formattedDate } = formatDate(date, 'dd/MM/yy');

  const uid = await getUserId();

  const reactions = {
    likes: likes ? likes.map(({ id }) => Number(id)) : [],
    // dislikes: dislikes.map(({ id }) => Number(id)),
    uid,
    reviewId,
  };

  return (
    <div className='col-md-12 mb40'>
      <div className='mt30 position-relative d-flex align-items-center justify-content-start mb30-sm'>
        <UserImage
          firstName={firstName}
          lastName={lastName}
          displayName={displayName}
          image={image}
          width={50}
          height={50}
          hideDisplayName={true}
        />
        <div className='ml20'>
          <h6 className='mt-0 mb-0'>{displayName}</h6>
          {showReviewsModel && (
            <LinkNP
              href={`/s/${service.slug}`}
              className='review-service-title'
            >
              <span>{service.title}</span>
            </LinkNP>
          )}
          <div className='d-flex align-items-center'>
            <div className='d-flex align-items-center'>
              <Rating
                count={5}
                value={rating}
                half={false}
                size={20}
                color1={'#6b7177'}
                color2={'#e1c03f'}
                onChange={null}
                edit={false}
              />
              <span className='ml5 fz14 fw600'>{formatUserRating(rating)}</span>
            </div>
            <span className='inline-divider'></span>
            <span className='review-date'>{formattedDate}</span>
          </div>
        </div>
      </div>
      <p className='text mt20 mb20'>{comment}</p>
      {/* <ReviewReactions data={reactions} /> */}
    </div>
  );
}
