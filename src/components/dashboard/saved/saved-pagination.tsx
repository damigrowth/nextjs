'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SavedPaginationProps {
  currentPage: number;
  totalPages: number;
  currentLimit: number;
  type: 'services' | 'profiles';
}

export default function SavedPagination({
  currentPage,
  totalPages,
  currentLimit,
  type,
}: SavedPaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const pageParam = type === 'services' ? 'servicesPage' : 'profilesPage';
  const limitParam = type === 'services' ? 'servicesLimit' : 'profilesLimit';

  const updatePage = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set(pageParam, page.toString());
    router.push(`/dashboard/saved?${params.toString()}#${type}`);
  };

  const updateLimit = (limit: string) => {
    const params = new URLSearchParams(searchParams);
    params.set(limitParam, limit);
    params.set(pageParam, '1'); // Reset to first page when changing page size
    router.push(`/dashboard/saved?${params.toString()}#${type}`);
  };

  return (
    <div className='flex flex-col sm:flex-row items-center justify-between gap-4'>
      {/* Page Size Selector */}
      <div className='flex items-center gap-2'>
        <span className='text-sm text-gray-600'>Εμφάνιση:</span>
        <Select value={currentLimit.toString()} onValueChange={updateLimit}>
          <SelectTrigger className='w-[120px]'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='12'>12 ανά σελίδα</SelectItem>
            <SelectItem value='24'>24 ανά σελίδα</SelectItem>
            <SelectItem value='48'>48 ανά σελίδα</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Pagination Controls */}
      <Pagination>
        <PaginationContent>
          {currentPage > 1 && (
            <PaginationItem>
              <PaginationPrevious
                onClick={() => updatePage(currentPage - 1)}
                className='cursor-pointer'
              />
            </PaginationItem>
          )}

          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((page) => {
              // Show first page, last page, and pages around current page
              return (
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1)
              );
            })
            .map((page, index, array) => (
              <React.Fragment key={page}>
                {/* Add ellipsis if there's a gap */}
                {index > 0 && array[index - 1] !== page - 1 && (
                  <PaginationItem>
                    <span className='px-3 py-2 text-gray-500'>...</span>
                  </PaginationItem>
                )}
                <PaginationItem>
                  <PaginationLink
                    onClick={() => updatePage(page)}
                    isActive={page === currentPage}
                    className='cursor-pointer'
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              </React.Fragment>
            ))}

          {currentPage < totalPages && (
            <PaginationItem>
              <PaginationNext
                onClick={() => updatePage(currentPage + 1)}
                className='cursor-pointer'
              />
            </PaginationItem>
          )}
        </PaginationContent>
      </Pagination>
    </div>
  );
}
