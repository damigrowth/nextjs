import React from 'react';
import Image from 'next/image';
import LinkNP from '@/components/link';

import InitialsImage from '../parts/freelancer-image-initials';
import TooltipTop from '../tooltip/tooltip-top';

export default function UserImage({
  image,
  width,
  height,
  alt,
  firstName,
  lastName,
  displayName,
  hideDisplayName,
  bigText,
  path,
  topLevel,
}) {
  const content = (
    <>
      <div className='position-relative'>
        {topLevel && (
          <div id='top-level' className='top-badge'>
            {/* <div className="icon ">
                      <span className="flaticon-badge" />
                    </div> */}
            <Image
              width={30}
              height={30}
              src='https://res.cloudinary.com/ddejhvzbf/image/upload/v1750076624/Static/top-badge_rajlxi.webp'
              alt='top badge'
            />
            <TooltipTop anchor='top-level'>
              Έχει λάβει εξαιρετικές αξιολογήσεις
            </TooltipTop>
          </div>
        )}
        {image ? (
          <Image
            width={!width ? 40 : width}
            height={!height ? 40 : height}
            className='rounded-circle'
            src={image}
            alt={alt || 'profile-image'}
            style={{ objectFit: 'cover' }}
          />
        ) : (
          <InitialsImage
            displayName={displayName}
            firstName={firstName}
            lastName={lastName}
            width={width}
            height={height}
            bigText={bigText}
          />
        )}
      </div>
      {displayName && !hideDisplayName && (
        <span className='fz14 lh-base ml10 ml5-xs'>{displayName}</span>
      )}
    </>
  );

  return (
    <div className='user-image-container'>
      {path ? (
        <LinkNP
          href={path}
          className='d-flex justify-content-center align-items-center'
        >
          {content}
        </LinkNP>
      ) : (
        content
      )}
    </div>
  );
}
