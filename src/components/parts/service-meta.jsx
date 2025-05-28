import { UserImage } from '@/components/avatar';
import { RatingTotal } from '@/components/parts';

import { Badges } from '../badge';

export default function Meta({
  title,
  image,
  firstName,
  lastName,
  username,
  displayName,
  rating,
  verified,
  totalReviews,
  topLevel,
}) {
  return (
    <div className='col-xl-12 mb30 pb30 bdrb1'>
      <div className='position-relative'>
        <h1 className='heading-h2'>{title}</h1>
        <div className='list-meta meta mt30'>
          <UserImage
            firstName={firstName}
            lastName={lastName}
            displayName={displayName}
            image={image}
            width={40}
            height={40}
            path={`/profile/${username}`}
          />
          <Badges verified={verified} topLevel={topLevel} />
          <RatingTotal
            totalReviews={totalReviews}
            rating={rating}
            clickable={true}
          />
        </div>
      </div>
    </div>
  );
}
