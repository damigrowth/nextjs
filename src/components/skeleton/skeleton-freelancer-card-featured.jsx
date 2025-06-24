import React from 'react';
import Skeleton from 'react-loading-skeleton';

export default function SkeletonFreelancerCard({ className = '' }) {
  return (
    <div
      className={`data-loading-element freelancer-style1 text-center bdr1 hover-box-shadow posiiton-relative w-100 ${className}`}
      style={{ maxHeight: '346px' }}
    >
      {/* Avatar placeholder */}
      <div className='thumb w90 mb25 mx-auto position-relative rounded-circle'>
        <Skeleton circle width={90} height={90} />
      </div>

      {/* Name placeholder */}
      <div className='text-center mb-3'>
        <Skeleton width={120} height={18} className='mb-1' />
        <Skeleton width={80} height={14} />
      </div>

      {/* Rating placeholder */}
      <div className='d-flex justify-content-center align-items-center mb-2'>
        <Skeleton circle width={12} height={12} className='me-1' />
        <Skeleton width={60} height={14} />
      </div>

      {/* Action button placeholder */}
      <div className='d-flex justify-content-center'>
        <Skeleton width={120} height={36} style={{ borderRadius: '6px' }} />
      </div>
    </div>
  );
}

export function SkeletonFreelancerCardGrid({ count = 4, className = '' }) {
  return (
    <div className={`row w-100 flash-small ${className}`}>
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className='col-xl-3 col-lg-4 col-md-6 col-sm-12 mb-4'>
          <SkeletonFreelancerCard />
        </div>
      ))}
    </div>
  );
}
