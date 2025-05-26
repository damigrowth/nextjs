import React from 'react';
import Skeleton from 'react-loading-skeleton';

export default function ManageServiceCardSkeleton() {
  return (
    <tr>
      <th className='dashboard-img-service' scope='row'>
        <div className='listing-style1 list-style d-block d-xl-flex align-items-start border-0 mb-0 shadow-none'>
          <div className='list-thumb flex-shrink-0 bdrs4 mb10-lg'>
            <Skeleton count={1} height={91} width={122} />
          </div>
          <div className='list-content flex-grow-1 py-0 pl15 pl0-lg'>
            <h6 className='list-title mb-0'>
              <Skeleton count={1} height={17} width={360} />
            </h6>
          </div>
        </div>
      </th>
      <td className='align-top'>
        <span className='fz15 fw400'>
          <Skeleton count={1} height={20} width={115} />
        </span>
      </td>
      <td className='align-top'>
        <Skeleton count={1} height={16} width={62} />
      </td>
      <td className='align-top'>
        <div className='d-flex justify-content-end'>
          <Skeleton count={1} height={40} width={40} />
        </div>
      </td>
    </tr>
  );
}
