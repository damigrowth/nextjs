'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Swiper, SwiperSlide, loadSwiperModules } from '@/components/swiper';
import LinkNP from '@/components/link';
import {
  ArrowLeftLong,
  ArrowRightLong,
  IconMagnifyingGlass,
} from '@/components/icon/fa';
import { SkeletonServiceCardGrid } from '@/components/skeleton';

let swiperModules = null;
const getSwiperModules = async () => {
  if (!swiperModules) {
    swiperModules = await loadSwiperModules();
  }
  return swiperModules;
};

/**
 * ServicesClientWrapper - Fixed to show single consistent skeleton
 */
export default function ServicesClientWrapper({
  renderedServiceCards,
  categories,
  pagination,
  isLoading = false,
  onPageChange,
  onCategoryChange,
  currentPage: propCurrentPage,
  activeCategory: propActiveCategory,
}) {
  const swiperRef = useRef(null);
  const [modules, setModules] = useState([]);

  // Use props or default values
  const activeCategory = propActiveCategory || undefined;
  const filteredServices = renderedServiceCards;
  const currentPage = propCurrentPage || pagination?.page || 1;
  const pageCount = pagination?.pageCount || 1;

  // Load Swiper modules on component mount
  useEffect(() => {
    getSwiperModules().then((loadedModules) => {
      setModules([loadedModules.Navigation, loadedModules.Pagination]);
    });
  }, []);

  const handleSlideChange = (swiper) => {
    const newPage = swiper.activeIndex + 1;
    if (newPage !== currentPage && !isLoading && onPageChange) {
      console.log(`📄 Services pagination: page ${currentPage} → ${newPage}`);
      onPageChange(newPage, activeCategory);
    }
  };

  const handlePageChange = (newPage) => {
    if (isLoading || !onPageChange) {
      console.log('⏳ Skipping page change - loading or no callback');
      return;
    }

    console.log(`📄 Manual page change: ${currentPage} → ${newPage}`);
    onPageChange(newPage, activeCategory);
  };

  const handleCategoryChange = (categorySlug) => {
    if (isLoading || !onCategoryChange) {
      console.log('⏳ Skipping category change - loading or no callback');
      return;
    }

    console.log(
      `📂 Category change: ${activeCategory || 'all'} → ${categorySlug || 'all'}`,
    );
    onCategoryChange(categorySlug);
  };

  // Update swiper position when page changes (without destroying)
  useEffect(() => {
    if (
      swiperRef.current &&
      swiperRef.current.activeIndex !== currentPage - 1 &&
      !isLoading
    ) {
      swiperRef.current.slideTo(currentPage - 1, 0);
    }
  }, [currentPage, isLoading]);

  // Reset to first page when category changes
  useEffect(() => {
    if (swiperRef.current && currentPage === 1) {
      swiperRef.current.slideTo(0, 0);
    }
  }, [activeCategory]);

  /**
   * FIXED: Create swiper slides - only show real content, no skeletons in inactive slides
   */
  const createDataPageSlides = () => {
    const slides = [];

    // Don't create slides if we're loading - this prevents multiple skeletons
    if (isLoading || filteredServices.length === 0) {
      return slides;
    }

    // Create slides for each page, but ALL pages show actual content
    for (let page = 1; page <= pageCount; page++) {
      slides.push(
        <SwiperSlide key={`page-${page}`}>
          <div className='services-page-content'>
            <div className='row'>
              {/* For current page, show actual cards. For other pages, show empty placeholder */}
              {page === currentPage ? (
                filteredServices.map((service) => (
                  <div
                    key={service.id}
                    className='col-xl-3 col-lg-4 col-md-6 col-sm-12 mb-4'
                  >
                    <div className='service-card-wrapper'>
                      {service.renderedCard}
                    </div>
                  </div>
                ))
              ) : (
                /* Empty placeholder for inactive pages - no skeleton */
                <div style={{ minHeight: '400px' }} />
              )}
            </div>
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
    allowTouchMove: !isLoading,
    watchSlidesProgress: true,
    touchRatio: 1,
    touchAngle: 45,
    grabCursor: !isLoading,
    speed: 300,
    preventClicks: isLoading,
    preventClicksPropagation: isLoading,
  };

  return (
    <section className='pb100 pt100 bgorange'>
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
                    } ${isLoading ? 'disabled' : ''}`}
                    onClick={() =>
                      !isLoading && handleCategoryChange(undefined)
                    }
                    disabled={isLoading}
                  >
                    Όλες οι Υπηρεσίες
                  </button>
                </li>
                {categories.map((category) => (
                  <li key={`cat-label-${category.slug}`} className='nav-item'>
                    <button
                      className={`nav-link fw500 dark-color ${
                        activeCategory === category.slug ? 'active' : ''
                      } ${isLoading ? 'disabled' : ''}`}
                      onClick={() =>
                        !isLoading && handleCategoryChange(category.slug)
                      }
                      disabled={isLoading}
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
              {/* FIXED: Single consistent loading state */}
              {isLoading ? (
                /* Show single skeleton during loading */
                <SkeletonServiceCardGrid count={4} />
              ) : filteredServices.length > 0 ? (
                <>
                  {/* Only show swiper when we have data and modules are ready */}
                  {modules.length > 0 ? (
                    <Swiper
                      {...swiperConfig}
                      modules={modules}
                      key={`services-swiper-${activeCategory || 'all'}`}
                      className='mySwiper outer-swiper'
                    >
                      {dataPageSlides}
                    </Swiper>
                  ) : (
                    /* Brief loading while modules load - same skeleton */
                    <SkeletonServiceCardGrid count={4} />
                  )}

                  {/* Navigation controls */}
                  {pageCount > 1 && modules.length > 0 && (
                    <div
                      className='swiper-navigation-wrapper'
                      key={`navigation-${activeCategory || 'all'}`}
                    >
                      <button className='swiper__btn btn__prev__services'>
                        <ArrowLeftLong />
                      </button>

                      <div className='swiper__pagination swiper__pagination__services'></div>

                      <button className='swiper__btn btn__next__services'>
                        <ArrowRightLong />
                      </button>
                    </div>
                  )}
                </>
              ) : (
                /* Empty state */
                <div className='row justify-content-center'>
                  <div className='col-12 text-center py-5'>
                    <div className='empty-state'>
                      <div className='empty-state-icon mb-3'>
                        <IconMagnifyingGlass
                          style={{ fontSize: '3rem', color: '#adb5bd' }}
                        />
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
                        <LinkNP
                          className='ud-btn2 text-black'
                          href='/ipiresies'
                        >
                          Όλες οι Υπηρεσίες
                          <ArrowRightLong />
                        </LinkNP>
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
