'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export default function Pagination1({
  pagination,
  paramKey = 'page',
  itemLabel = 'Υπηρεσίες',
  preserveParams = true,
}) {
  const router = useRouter();

  const pathname = usePathname();

  const searchParams = useSearchParams();

  const { page = 1, pageCount = 1, total = 0, pageSize = 5 } = pagination || {};

  const createPageURL = (pageNumber) => {
    const params = new URLSearchParams(
      preserveParams ? searchParams : undefined,
    );

    params.set(paramKey, pageNumber.toString());

    return `${pathname}?${params.toString()}`;
  };

  const handlePageChange = (pageNumber) => {
    router.push(createPageURL(pageNumber));
  };

  // Generate array of page numbers to display
  const getPageNumbers = () => {
    const pages = [];

    const maxVisiblePages = 5;

    if (pageCount <= maxVisiblePages) {
      // Show all pages if total pages are less than max visible
      for (let i = 1; i <= pageCount; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      if (page > 3) {
        pages.push('...');
      }
      // Show current page and surrounding pages
      for (
        let i = Math.max(2, page - 1);
        i <= Math.min(pageCount - 1, page + 1);
        i++
      ) {
        pages.push(i);
      }
      if (page < pageCount - 2) {
        pages.push('...');
      }
      // Always show last page
      pages.push(pageCount);
    }

    return pages;
  };

  return (
    <>
      <div
        className={`mbp_pagination text-center ${pathname === '/shop-list' ? 'mt30' : ''}`}
      >
        <ul className='page_navigation'>
          {/* Previous button */}
          <li className={`page-item ${page <= 1 ? 'disabled' : ''}`}>
            <button
              className='page-link'
              onClick={() => page > 1 && handlePageChange(page - 1)}
              disabled={page <= 1}
            >
              <span className='fas fa-angle-left' />
            </button>
          </li>
          {/* Page numbers */}
          {getPageNumbers().map((pageNum, index) => (
            <li
              key={index}
              className={`page-item ${pageNum === page ? 'active' : ''} ${
                pageNum === '...' ? 'disabled' : ''
              }`}
            >
              <button
                className='page-link'
                onClick={() => pageNum !== '...' && handlePageChange(pageNum)}
                disabled={pageNum === '...'}
              >
                {pageNum}
                {pageNum === page && <span className='sr-only'>(current)</span>}
              </button>
            </li>
          ))}
          {/* Next button */}
          <li className={`page-item ${page >= pageCount ? 'disabled' : ''}`}>
            <button
              className='page-link'
              onClick={() => page < pageCount && handlePageChange(page + 1)}
              disabled={page >= pageCount}
            >
              <span className='fas fa-angle-right' />
            </button>
          </li>
        </ul>
        <p className='mt10 mb-0 pagination_page_count text-center'>
          {total > 0 ? (
            <>
              {(page - 1) * pageSize + 1} – {Math.min(page * pageSize, total)}{' '}
              από {total} {itemLabel}
            </>
          ) : (
            <>0 {itemLabel}</>
          )}
        </p>
      </div>
    </>
  );
}
