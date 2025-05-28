'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

import useHomeStore from '@/stores/home/homeStore';

export default function SearchButton() {
  const router = useRouter();

  const { searchTerm, categorySelect } = useHomeStore();

  const categorySlug = categorySelect?.attributes?.slug;

  const handleSearch = () => {
    if (!categorySlug) {
      router.push(`/ipiresies?search=${searchTerm}`);
    } else {
      router.push(`/ipiresies/${categorySlug}?search=${searchTerm}`);
    }
  };

  return (
    <button
      className='ud-btn btn-dark w-100 bdrs60 h-100 butgreen'
      type='button'
      onClick={handleSearch}
    >
      Αναζήτηση
    </button>
  );
}
