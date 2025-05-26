'use client';

import React from 'react';
import Image from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import useArchiveStore from '@/stores/archive/archiveStore';

export default function SidebarModalBtn({ type }) {
  const { filtersModalHandler } = useArchiveStore();

  const router = useRouter();

  const pathname = usePathname();

  const searchParams = useSearchParams();

  const handleClose = () => {
    // Πριν κλείσει το modal, εφαρμόζουμε τα φίλτρα αναδημιουργώντας το URL
    // Διατηρούμε τα τρέχοντα parameters
    const params = new URLSearchParams(searchParams.toString());

    // Ανανεώνουμε τη σελίδα με τα φίλτρα που έχουν επιλεχθεί
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
    // Κλείνουμε το modal
    filtersModalHandler();
  };

  if (type === 'close') {
    return (
      <div onClick={handleClose} className='sidebar-close-icon'>
        <span className='far fa-times' />
      </div>
    );
  } else {
    return (
      <button
        onClick={filtersModalHandler}
        type='button'
        className='open-btn filter-btn-left mt20'
      >
        <Image
          height={18}
          width={18}
          className='me-2'
          src='/images/icon/all-filter-icon.svg'
          alt='icon'
        />
        Όλα τα φίλτρα
      </button>
    );
  }
}
