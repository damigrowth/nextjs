'use client';

import React from 'react';
import { IconAngleLeft, IconAngleRight } from '@/components/icon/fa';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export default function Pagination({ meta, plural }) {
  // Handle undefined meta by providing default values
  const { pageSize = 10, pageCount = 0, total = 0 } = meta || {};

  const router = useRouter();

  const pathname = usePathname();

  const searchParams = useSearchParams();

  const currentPage = parseInt(searchParams.get('page'), 10) || 1;

  const handlePageChange = (page) => {
    const params = new URLSearchParams(searchParams.toString());

    params.set('page', page);
    router.push(pathname + '?' + params, {
      scroll: false,
    });
  };

  const pages = Array.from({ length: pageCount }, (_, i) => i + 1);

  // Don't show pagination if meta is undefined, total is less than 20, or pageCount is 0
  if (!meta || total < 20 || pageCount <= 1) return null;

  return (
    <div className='mbp_pagination text-center'>
      <ul className='page_navigation'>
        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
          <a
            className='page-link'
            onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
            style={{ cursor: currentPage === 1 ? 'default' : 'pointer' }}
          >
            <IconAngleLeft />
          </a>
        </li>
        {pages.map((page) => (
          <li
            key={page}
            className={`page-item ${currentPage === page ? 'active' : ''}`}
          >
            <a
              className='page-link'
              href='#archive'
              onClick={() => handlePageChange(page)}
              style={{ cursor: 'pointer' }}
            >
              {page}
            </a>
          </li>
        ))}
        <li
          className={`page-item ${currentPage === pageCount ? 'disabled' : ''}`}
        >
          <a
            className='page-link'
            onClick={() =>
              currentPage < pageCount && handlePageChange(currentPage + 1)
            }
            style={{
              cursor: currentPage === pageCount ? 'default' : 'pointer',
            }}
          >
            <IconAngleRight />
          </a>
        </li>
      </ul>
      <p className='mt10 mb-0 pagination_page_count text-center'>
        {`${(currentPage - 1) * pageSize + 1} – ${
          currentPage * pageSize > total ? total : currentPage * pageSize
        } από ${total} ${plural}`}
      </p>
    </div>
  );
}
