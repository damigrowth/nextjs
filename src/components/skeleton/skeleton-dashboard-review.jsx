import React from 'react';
import Skeleton from 'react-loading-skeleton';

export default function ReviewCommentSkeleton() {
  return (
    <div className='pb20 bdrb1'>
      <div className='mbp_first position-relative d-sm-flex align-items-center justify-content-start mb30-sm mt30'>
        {/* User avatar skeleton */}
        <div className='user-image-wrapper'>
          <Skeleton borderRadius={15} width={60} height={60} />
        </div>
        <div className='ml20 ml0-xs mt20-xs'>
          {/* Display name skeleton */}
          <h6 className='mt-0 mb-1'>
            <Skeleton width={150} height={18} />
          </h6>
          <div className='d-flex align-items-center'>
            {/* Rating skeleton */}
            <div>
              <Skeleton width={60} height={16} />
            </div>
            {/* Time ago skeleton */}
            <div className='ms-3'>
              <Skeleton width={120} height={14} />
            </div>
          </div>
        </div>
      </div>
      {/* Comment text skeleton */}
      <div className='text mt20 mb20'>
        <Skeleton count={1} height={16} />
      </div>
    </div>
  );
}
