'use client';

import { useEffect, useState } from 'react';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import listingStore from '@/stores/listingStore';
import priceStore from '@/stores/priceStore';
import { ArrowRightLong } from '../icon/fa';

export default function ClearButton({ alwaysShow = false }) {
  const router = useRouter();

  const pathname = usePathname();

  const searchParams = useSearchParams();

  const [hasArchiveFilters, setHasArchiveFilters] = useState(false);

  useEffect(() => {
    // Έλεγχος αν υπάρχουν παράμετροι φίλτρων archive
    const hasFilters = Array.from(searchParams.keys()).some((key) =>
      ['min', 'max', 'time', 'cat', 'tags', 'ver', 'sort'].includes(key),
    );

    setHasArchiveFilters(hasFilters);
  }, [searchParams]);

  // set handlers
  const setDeliveryTime = listingStore((state) => state.setDeliveryTime);

  const setLevel = listingStore((state) => state.setLevel);

  const setLocation = listingStore((state) => state.setLocation);

  const setBestSeller = listingStore((state) => state.setBestSeller);

  const setDesginTool = listingStore((state) => state.setDesginTool);

  const setSpeak = listingStore((state) => state.setSpeak);

  const setPriceRange = priceStore((state) => state.priceRangeHandler);

  const setSearch = listingStore((state) => state.setSearch);

  const setCategory = listingStore((state) => state.setCategory);

  const setProjectType = listingStore((state) => state.setProjectType);

  const setEnglishLevel = listingStore((state) => state.setEnglishLevel);

  const setJobType = listingStore((state) => state.setJobType);

  const setNoOfEmployee = listingStore((state) => state.setNoOfEmployee);

  // get state
  const getDeliveryTime = listingStore((state) => state.getDeliveryTime);

  const getLevel = listingStore((state) => state.getLevel);

  const getLocation = listingStore((state) => state.getLocation);

  const getBestSeller = listingStore((state) => state.getBestSeller);

  const getDesginTool = listingStore((state) => state.getDesginTool);

  const getSpeak = listingStore((state) => state.getSpeak);

  const getPriceRange = priceStore((state) => state.priceRange);

  const getSearch = listingStore((state) => state.getSearch);

  const getCategory = listingStore((state) => state.getCategory);

  const getProjectType = listingStore((state) => state.getProjectType);

  const getEnglishLevel = listingStore((state) => state.getEnglishLevel);

  const getJobType = listingStore((state) => state.getJobType);

  const getNoOfEmployee = listingStore((state) => state.getNoOfEmployee);

  // clear handler
  const clearHandler = () => {
    // Καθαρισμός των store filters
    setDeliveryTime('');
    setLevel([]);
    setLocation([]);
    setBestSeller('best-seller');
    setDesginTool([]);
    setSpeak([]);
    setPriceRange(0, 100000);
    setSearch('');
    setCategory([]);
    setProjectType([]);
    setEnglishLevel([]);
    setJobType([]);
    setNoOfEmployee([]);
    // Καθαρισμός των URL parameters για τις archive σελίδες
    if (
      pathname.includes('ipiresies') ||
      pathname.includes('companies') ||
      pathname.includes('pros')
    ) {
      // Κράτησε μόνο το page=1 παράμετρο
      router.push(`${pathname}?page=1`, { scroll: false });
    }
  };

  // Έλεγχος εάν υπάρχουν ενεργά φίλτρα για την εμφάνιση του κουμπιού
  const hasActiveFilters =
    getDeliveryTime !== '' ||
    getLevel?.length !== 0 ||
    getLocation?.length !== 0 ||
    getSearch !== '' ||
    getBestSeller !== 'best-seller' ||
    getDesginTool?.length !== 0 ||
    getSpeak?.length !== 0 ||
    getPriceRange.min !== 0 ||
    getPriceRange.max !== 100000 ||
    getCategory?.length !== 0 ||
    getProjectType?.length !== 0 ||
    getEnglishLevel?.length !== 0 ||
    getJobType?.length !== 0 ||
    getNoOfEmployee?.length !== 0 ||
    hasArchiveFilters;

  return (
    <>
      {alwaysShow || hasActiveFilters ? (
        <button
          onClick={clearHandler}
          className='ud-btn btn-thm ui-clear-btn w-100'
        >
          Καθαρισμός φίλτρων
          <ArrowRightLong />
        </button>
      ) : (
        ''
      )}
    </>
  );
}
