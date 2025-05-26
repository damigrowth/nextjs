import React from 'react';

export default function ReviewStatsLine({ data }) {
  return (
    <div className='review-list d-flex align-items-center mb10'>
      <div className='list-number'>
        {data.stars}{' '}
        {data.stars === 1 ? (
          <span style={{ paddingRight: '12.5px' }}>Αστέρι</span>
        ) : (
          'Αστέρια'
        )}
      </div>
      <div className='progress'>
        <div
          className='progress-bar'
          style={{
            width: `${data.value}%`,
          }}
          aria-valuenow={data.value}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
      <div className='value text-end'>{data.count}</div>
    </div>
  );
}
