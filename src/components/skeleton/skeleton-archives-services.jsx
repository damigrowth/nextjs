import React from 'react';
import Skeleton from 'react-loading-skeleton';

import { serviceSortOptions } from '../../constants/options';
import SortOptions from '../archive/archives-sort-options';
import ServiceGridSkeleton from './skeleton-archives-services-grid';

export default function ContentSkeleton() {
  return (
    <>
      <div className='row align-items-center mb20'>
        <div className='col-md-6'>
          <div className='text-center text-md-start'>
            <p className='text mb-0 mb10-sm'>
              <span className='fw500'>
                <Skeleton count={1} height={20} width={115} />
              </span>
            </p>
          </div>
        </div>
        <div className='col-md-6'>
          <div className='page_control_shorting d-md-flex align-items-center justify-content-center justify-content-md-end'>
            <div className='dropdown-lists d-block d-lg-none me-2 mb10-sm'></div>
            <SortOptions sortOptions={serviceSortOptions} />
          </div>
        </div>
      </div>
      <ServiceGridSkeleton />
      <div className='row mt30'>
        <div className='mbp_pagination text-center'>
          <ul className='page_navigation'></ul>
          <p className='mt10 mb-0 pagination_page_count text-center'></p>
        </div>
      </div>
    </>
  );
}
