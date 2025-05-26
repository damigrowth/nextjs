'use client';

import React from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import useArchiveStore from '@/stores/archive/archiveStore';

export default function SidebarModalOverlay() {
  const { filtersModalToggled, filtersModalHandler } = useArchiveStore();

  const router = useRouter();

  const pathname = usePathname();

  const searchParams = useSearchParams();

  const handleOverlayClick = () => {
    // Πριν κλείσει το modal, εφαρμόζουμε τα φίλτρα αναδημιουργώντας το URL
    if (filtersModalToggled) {
      // Διατηρούμε τα τρέχοντα parameters
      const params = new URLSearchParams(searchParams.toString());

      // Ανανεώνουμε τη σελίδα με τα φίλτρα που έχουν επιλεχθεί
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
      // Κλείνουμε το modal
      filtersModalHandler();
    }
  };

  return (
    <div
      onClick={handleOverlayClick}
      className={`body-overlay-mobile-desktop ${filtersModalToggled ? 'active' : ''}`}
    />
  );
}
