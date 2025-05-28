'use client';

import React, { useActionState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

import { homeSearch } from '@/actions';
import useHomeStore from '@/stores/home/homeStore';

const debounce = (func, delay) => {
  let timeoutId;

  return (...args) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
};

export default function Search() {
  const router = useRouter();

  const [res, action, pending] = useActionState(homeSearch);

  const formRef = useRef(null);

  const isInitialMount = useRef(true);

  const preventBlurRef = useRef(false);

  const {
    searchTerm,
    setSearchTerm,
    categorySelect,
    isSearchDropdownOpen,
    focusDropdown,
    blurDropdown,
  } = useHomeStore();

  const categorySlug = categorySelect?.attributes?.slug || '';

  // Trigger search when category changes, but not on initial mount
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;

      return;
    }

    const timeoutId = setTimeout(() => {
      formRef.current?.requestSubmit();
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [categorySelect]);

  const handleSearch = useCallback(
    (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();

        const searchPath = `/ipiresies?search=${searchTerm}`;

        // const searchPath = categorySlug
        //   ? `/ipiresies/${categorySlug}?search=${searchTerm}`
        //   : `/ipiresies?search=${searchTerm}`;
        router.push(searchPath);
      }
    },
    [categorySlug, searchTerm, router],
  );

  const debouncedSubmit = useCallback(
    debounce(() => {
      if (!isInitialMount.current) {
        formRef.current?.requestSubmit();
      }
    }, 500),
    [],
  );

  const handleResultClick = useCallback(
    (item) => {
      if (item.type === 'subcategory') {
        router.push(`/ipiresies/${item.slug}`);
      }
      if (item.type === 'subdivision') {
        router.push(`/ipiresies/${item.parentSlug}/${item.slug}`);
      }
      setSearchTerm('');
      blurDropdown();
    },
    [router, setSearchTerm, blurDropdown],
  );

  const handleMouseDown = () => {
    preventBlurRef.current = true;
  };

  const handleMouseUp = () => {
    preventBlurRef.current = false;
  };

  const handleInputBlur = () => {
    if (!preventBlurRef.current) {
      blurDropdown();
    }
  };

  useEffect(() => {
    if (searchTerm && !isInitialMount.current) {
      debouncedSubmit();
    }
  }, [searchTerm, debouncedSubmit]);

  return (
    <>
      <form
        ref={formRef}
        action={action}
        className='form-search position-relative'
        autoComplete='off'
        onSubmit={(e) => {
          if (isInitialMount.current) {
            e.preventDefault();
          }
        }}
      >
        <div className='box-search'>
          {pending ? (
            <div
              className='icon spinner-border spinner-border-sm'
              role='status'
              style={{ bottom: '20px' }}
            >
              <span className='sr-only'>Loading...</span>
            </div>
          ) : (
            <span className='icon far fa-magnifying-glass' />
          )}
          <input
            type='hidden'
            id='category'
            name='category'
            value={JSON.stringify(categorySlug)}
          />
          <input
            type='text'
            id='searchTerm'
            name='searchTerm'
            placeholder='Τι υπηρεσία ψάχνεις;'
            className='form-control'
            onFocus={focusDropdown}
            onBlur={handleInputBlur}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleSearch}
            aria-label='Search services'
          />
          {res?.data?.length > 0 && (
            <div
              className='search-suggestions'
              style={{
                visibility: isSearchDropdownOpen ? 'visible' : 'hidden',
                opacity: isSearchDropdownOpen ? '1' : '0',
                top: isSearchDropdownOpen ? '70px' : '100px',
                transition: 'all 0.3s ease',
              }}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
            >
              <div className='box-suggestions'>
                <ul className='px-0 m-0 pb-4'>
                  {res.data.map((sub, index) => (
                    <li key={index}>
                      <div
                        className='info-product cursor-pointer'
                        onClick={() => handleResultClick(sub)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleResultClick(sub);
                          }
                        }}
                        role='button'
                        tabIndex={0}
                      >
                        <div className='item_title'>{sub.label}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </form>
    </>
  );
}
