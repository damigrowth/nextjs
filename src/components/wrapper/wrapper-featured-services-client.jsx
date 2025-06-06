'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';

// Import required modules for Swiper v8
import SwiperCore, { Navigation, Pagination } from 'swiper';
import Link from 'next/link';

SwiperCore.use([Navigation, Pagination]);

/**
 * @typedef {object} ServicesClientWrapperProps
 * @property {Array<object>} renderedServiceCards - Pre-rendered service cards from the server component.
 * @property {Array<object>} categories - List of service categories with slug and label.
 * @property {object} pagination - Pagination information including page, pageCount, pageSize, and total.
 */

/**
 * ServicesClientWrapper component provides client-side interactivity for featured services,
 * including category filtering and Swiper-based pagination.
 * @param {ServicesClientWrapperProps} props - The component props.
 * @returns {JSX.Element} The JSX element for the services client wrapper.
 */
export default function ServicesClientWrapper({
  renderedServiceCards,
  categories,
  pagination,
}) {
  const swiperRef = useRef(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isSwiperReady, setIsSwiperReady] = useState(false);

  const activeCategory = searchParams.get('sc') || undefined;

  const filteredServices = renderedServiceCards;

  const currentPage = pagination?.page || 1;
  const pageCount = pagination?.pageCount || 1;

  const handleSlideChange = (swiper) => {
    const newPage = swiper.activeIndex + 1;
    if (newPage !== currentPage) {
      handlePageChange(newPage);
    }
  };

  const handlePageChange = (newPage) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    current.set('sp', newPage.toString());

    if (activeCategory) {
      current.set('sc', activeCategory);
    } else {
      current.delete('sc');
    }

    const query = current.toString();
    router.push(`/?${query}`, { scroll: false });
  };

  const handleCategoryChange = (categorySlug) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));

    current.set('sp', '1');

    if (categorySlug) {
      current.set('sc', categorySlug);
    } else {
      current.delete('sc');
    }

    const query = current.toString();
    router.push(`/?${query}`, { scroll: false });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSwiperReady(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setIsSwiperReady(false);
    const timer = setTimeout(() => {
      setIsSwiperReady(true);
    }, 50);

    return () => clearTimeout(timer);
  }, [activeCategory]);

  useEffect(() => {
    if (
      swiperRef.current &&
      swiperRef.current.activeIndex !== currentPage - 1
    ) {
      swiperRef.current.slideTo(currentPage - 1, 0);
    }
  }, [currentPage]);

  useEffect(() => {
    if (swiperRef.current && currentPage === 1) {
      swiperRef.current.slideTo(0, 0);
    }
  }, [activeCategory]);

  useEffect(() => {
    if (swiperRef.current) {
      swiperRef.current.destroy(true, true);
      swiperRef.current = null;
    }

    const timer = setTimeout(() => {
      if (swiperRef.current) {
        swiperRef.current.update();
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [activeCategory]);

  const createDataPageSlides = () => {
    const slides = [];

    if (filteredServices.length === 0) {
      return slides;
    }

    for (let page = 1; page <= pageCount; page++) {
      slides.push(
        <SwiperSlide key={`page-${page}`}>
          <div className='services-page-content'>
            {page === currentPage ? (
              <div className='row'>
                {filteredServices.map((service) => (
                  <div
                    key={service.id}
                    className='col-xl-3 col-lg-4 col-md-6 col-sm-12 mb-4'
                  >
                    <div className='service-card-wrapper'>
                      {service.renderedCard}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className='row'>
                <div className='col-12 text-center py-5'>
                  <div className='loading-placeholder'>
                    <div className='spinner-border text-thm2' role='status'>
                      <span className='visually-hidden'>Loading...</span>
                    </div>
                    <p className='mt-3 text-muted'>Φόρτωση σελίδας {page}...</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </SwiperSlide>,
      );
    }

    return slides;
  };

  const dataPageSlides = createDataPageSlides();

  const swiperConfig = {
    spaceBetween: 0,
    slidesPerView: 1,
    initialSlide: currentPage - 1,
    navigation: {
      prevEl: '.btn__prev__services',
      nextEl: '.btn__next__services',
    },
    pagination: {
      el: '.swiper__pagination__services',
      clickable: true,
      type: 'bullets',
      dynamicBullets: pageCount > 7,
      dynamicMainBullets: 3,
    },
    onSwiper: (swiper) => {
      swiperRef.current = swiper;
    },
    onSlideChange: handleSlideChange,
    allowTouchMove: true,
    watchSlidesProgress: true,
    touchRatio: 1,
    touchAngle: 45,
    grabCursor: true,
    speed: 300,
    preventClicks: false,
    preventClicksPropagation: false,
  };

  return (
    <section className='pt-0 pb100 pt100 bgorange'>
      <div className='container'>
        <div className='row align-items-center wow fadeInUp'>
          <div className='col-xl-3'>
            <div className='main-title mb30-lg'>
              <h2 className='title'>Δημοφιλείς Υπηρεσίες</h2>
              <p className='paragraph'>Οι υπηρεσίες με τη μεγαλύτερη ζήτηση.</p>
            </div>
          </div>
          <div className='col-xl-9'>
            <div className='navpill-style2 at-home9 mb50-lg nav-container'>
              <ul
                className='nav nav-pills mb20 justify-content-xl-end'
                id='pills-tab'
              >
                <li className='nav-item'>
                  <button
                    className={`nav-link fw500 dark-color ${
                      !activeCategory ? 'active' : ''
                    }`}
                    onClick={() => handleCategoryChange(undefined)}
                  >
                    Όλες οι Υπηρεσίες
                  </button>
                </li>
                {categories.map((category) => (
                  <li key={`cat-label-${category.slug}`} className='nav-item'>
                    <button
                      className={`nav-link fw500 dark-color ${
                        activeCategory === category.slug ? 'active' : ''
                      }`}
                      onClick={() => handleCategoryChange(category.slug)}
                    >
                      {category.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className='row wow fadeInUp'>
          <div className='col-lg-12'>
            <div className='navi_pagi_bottom_center'>
              {filteredServices.length > 0 ? (
                <>
                  {isSwiperReady ? (
                    <Swiper
                      {...swiperConfig}
                      key={`services-swiper-${activeCategory || 'all'}-${isSwiperReady}`}
                      className='mySwiper outer-swiper'
                    >
                      {dataPageSlides}
                    </Swiper>
                  ) : (
                    <div
                      className='swiper-loading'
                      style={{
                        minHeight: '400px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <div className='spinner-border text-thm2' role='status'>
                        <span className='visually-hidden'>Initializing...</span>
                      </div>
                    </div>
                  )}

                  {pageCount > 1 && isSwiperReady && (
                    <div
                      className='swiper-navigation-wrapper'
                      key={`navigation-${activeCategory || 'all'}`}
                    >
                      <button className='swiper__btn btn__prev__services'>
                        <i className='far fa-arrow-left-long' />
                      </button>

                      <div className='swiper__pagination swiper__pagination__services'></div>

                      <button className='swiper__btn btn__next__services'>
                        <i className='far fa-arrow-right-long' />
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className='row justify-content-center'>
                  <div className='col-12 text-center py-5'>
                    <div className='empty-state'>
                      <div className='empty-state-icon mb-3'>
                        <i
                          className='fas fa-search'
                          style={{ fontSize: '3rem', color: '#adb5bd' }}
                        ></i>
                      </div>
                      <h4 className='empty-state-title'>
                        {!activeCategory
                          ? 'Δεν βρέθηκαν υπηρεσίες.'
                          : `Δεν βρέθηκαν υπηρεσίες για την κατηγορία "${categories.find((cat) => cat.slug === activeCategory)?.label || activeCategory}".`}
                      </h4>
                      <p className='text-muted mb-3'>
                        {!activeCategory
                          ? 'Δοκιμάστε να ελέγξετε αργότερα ή επικοινωνήστε μαζί μας.'
                          : 'Δοκιμάστε μια διαφορετική κατηγορία ή δείτε όλες τις διαθέσιμες υπηρεσίες.'}
                      </p>
                      {activeCategory && (
                        <Link className='ud-btn2 text-black' href='/ipiresies'>
                          Όλες οι Υπηρεσίες
                          <i className='fal fa-arrow-right-long' />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
