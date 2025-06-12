'use client';

import React, { useCallback, useEffect, useState, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { IconArrowDownLong } from '@/components/icon/fa';

export default function LoadMoreBtn({
  name,
  paramsName,
  paramsPage,
  total,
  count,
}) {
  const searchParams = useSearchParams();

  const router = useRouter();

  const pathname = usePathname(); // Use the current pathname

  const [isPending, startTransition] = useTransition();

  // Get a new searchParams string by merging the current
  // searchParams with a provided key/value pair
  const createQueryString = useCallback(
    (name, value) => {
      const params = new URLSearchParams(searchParams.toString());

      params.set(name, value);

      return params.toString();
    },
    [searchParams],
  );

  const handleNewParamsPage = () => {
    const nextPage = paramsPage + 1;

    startTransition(() => {
      router.push(pathname + '?' + createQueryString(paramsName, nextPage), {
        scroll: false,
      });
    });
  };

  if (count >= total) {
    return null; // Hide the button if there are no more pages
  }

  return (
    <div className='pb20'>
      <button
        onClick={handleNewParamsPage}
        className='ud-btn btn-dark default-box-shadow2'
      >
        Περισσότερες {name}
        {isPending ? (
          <div className='spinner-border spinner-border-sm ml10' role='status'>
            <span className='sr-only'></span>
          </div>
        ) : (
          <IconArrowDownLong />
        )}
      </button>
    </div>
  );
}
