import React from 'react';
import Skeleton from 'react-loading-skeleton';

export default function SkeletonServiceCardFeatured({ className = '' }) {
  return (
    <div className={`listing-style1 bdrs16 ${className}`}>
      {/* Image placeholder - matches exact dimensions */}
      <div className='list-thumb'>
        <Skeleton
          height={247}
          style={{ borderRadius: '16px 16px 0 0', display: 'flex' }}
        />
      </div>

      {/* Content placeholder - matches structure */}
      <div className='list-content'>
        {/* Category placeholder */}
        <div className='mb-1'>
          <Skeleton width={80} height={14} />
        </div>

        {/* Title placeholder - two lines */}
        <div className='service-card-title mb-2'>
          <Skeleton height={20} style={{ marginBottom: '6px' }} />
          <Skeleton width='60%' height={20} />
        </div>

        {/* Review meta placeholder */}
        <div className='review-meta d-flex align-items-center mb-2'>
          <Skeleton width={12} height={12} style={{ marginRight: '8px' }} />
          <Skeleton width={120} height={14} />
        </div>

        {/* HR divider */}
        <hr className='my-2' />

        {/* Bottom meta placeholder */}
        <div className='list-meta d-flex justify-content-between align-items-center mt15'>
          {/* Avatar placeholder */}
          <Skeleton circle width={30} height={30} />

          {/* Price placeholder */}
          <Skeleton width={60} height={16} />
        </div>
      </div>
    </div>
  );
}

export function SkeletonServiceCardGrid({ count = 4, className = '' }) {
  return (
    <div className={`row w-100 flash-big ${className}`}>
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className='col-xl-3 col-lg-4 col-md-6 col-sm-12 mb-4'>
          <div className='service-card-wrapper'>
            <SkeletonServiceCardFeatured />
          </div>
        </div>
      ))}
    </div>
  );
}

export function InlineServiceCardSkeleton() {
  return (
    <>
      {/* Category */}
      <Skeleton width={80} height={14} className='mb-1' />

      {/* Title */}
      <div className='mb-2'>
        <Skeleton height={20} className='mb-1' />
        <Skeleton width='60%' height={20} />
      </div>

      {/* Reviews */}
      <div className='d-flex align-items-center mb-2'>
        <Skeleton circle width={12} height={12} className='me-2' />
        <Skeleton width={120} height={14} />
      </div>

      {/* Divider space */}
      <div style={{ height: '1px', margin: '8px 0' }} />

      {/* Bottom section */}
      <div className='d-flex justify-content-between align-items-center'>
        <Skeleton circle width={30} height={30} />
        <Skeleton width={60} height={16} />
      </div>
    </>
  );
}
