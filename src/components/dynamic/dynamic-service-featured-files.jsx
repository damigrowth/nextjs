'use client';

import dynamic from 'next/dynamic';

const ServiceFeaturedFiles = dynamic(
  () => import('../parts/service-featured-files'),
  {
    ssr: false,
    loading: () => (
      <div className='featured-files-loading p-4 text-center'>
        <div className='placeholder-glow'>
          <div
            className='placeholder bg-secondary'
            style={{ height: '400px', borderRadius: '8px' }}
          ></div>
          <div className='d-flex gap-2 mt-3'>
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className='placeholder bg-secondary'
                style={{ width: '80px', height: '60px', borderRadius: '4px' }}
              ></div>
            ))}
          </div>
        </div>
      </div>
    ),
  },
);

export default function ServiceFeaturedFiles_D(props) {
  return <ServiceFeaturedFiles {...props} />;
}
