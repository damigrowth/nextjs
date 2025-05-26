import React from 'react';
import Skeleton from 'react-loading-skeleton';

export default function ServiceGridSkeleton() {
  return (
    <div className='row'>
      <div className='col-lg-12'>
        {new Array(6).fill().map((_, i) => (
          <div key={i}>
            <Skeleton
              count={1}
              height={191}
              borderRadius={4}
              style={{ display: 'block' }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
