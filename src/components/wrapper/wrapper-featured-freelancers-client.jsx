'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Swiper, SwiperSlide, loadSwiperModules } from '@/components/swiper';
import LinkNP from '@/components/link';
import { ArrowLeftLong, ArrowRightLong, IconUsers } from '@/components/icon/fa';
import { SkeletonFreelancerCardGrid } from '../skeleton';

let swiperModules = null;
const getSwiperModules = async () => {
  if (!swiperModules) {
    swiperModules = await loadSwiperModules();
  }
  return swiperModules;
};

/**
 * FreelancersClientWrapper - Fixed to show single consistent skeleton
 */
export default function FreelancersClientWrapper({
  renderedFreelancerCards,
  pagination,
  isLoading = false,
  onPageChange,
  currentPage: propCurrentPage,
}) {
  const swiperRef = useRef(null);
  const [modules, setModules] = useState([]);

  const filteredFreelancers = renderedFreelancerCards;
  const currentPage = propCurrentPage || pagination?.page || 1;
  const pageCount = pagination?.pageCount || 1;

  useEffect(() => {
    getSwiperModules().then((loadedModules) => {
      setModules([loadedModules.Navigation, loadedModules.Pagination]);
    });
  }, []);

  const handleSlideChange = (swiper) => {
    const newPage = swiper.activeIndex + 1;
    if (newPage !== currentPage && !isLoading && onPageChange) {
      onPageChange(newPage);
    }
  };

  const handlePageChange = (newPage) => {
    if (isLoading || !onPageChange) {
      return;
    }

    onPageChange(newPage);
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

  /**
   * FIXED: Create swiper slides - only show real content, no skeletons in inactive slides
   */
  const createDataPageSlides = () => {
    const slides = [];

    // Don't create slides if we're loading - this prevents multiple skeletons
    if (isLoading || filteredFreelancers.length === 0) {
      return slides;
    }

    // Create slides for each page, but ALL pages show actual content
    for (let page = 1; page <= pageCount; page++) {
      slides.push(
        <SwiperSlide key={`page-${page}`}>
          <div className='freelancers-page-content'>
            <div className='row'>
              {/* For current page, show actual cards. For other pages, show empty placeholder */}
              {page === currentPage ? (
                filteredFreelancers.map((freelancer) => (
                  <div
                    key={freelancer.id}
                    className='col-xl-3 col-lg-4 col-md-6 col-sm-12 mb-4'
                  >
                    <div className='freelancer-card-wrapper'>
                      {freelancer.renderedCard}
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
      prevEl: '.btn__prev__freelancers',
      nextEl: '.btn__next__freelancers',
    },
    pagination: {
      el: '.swiper__pagination__freelancers',
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
    <div className='navi_pagi_bottom_center_freelancers'>
      {/* FIXED: Single consistent loading state */}
      {isLoading ? (
        /* Show single skeleton during loading */
        <SkeletonFreelancerCardGrid count={4} />
      ) : filteredFreelancers.length > 0 ? (
        <>
          {/* Only show swiper when we have data and modules are ready */}
          {modules.length > 0 ? (
            <Swiper
              {...swiperConfig}
              modules={modules}
              key={`freelancers-swiper`}
              className='mySwiper outer-swiper-freelancers'
            >
              {dataPageSlides}
            </Swiper>
          ) : (
            /* Brief loading while modules load - same skeleton */
            <SkeletonFreelancerCardGrid count={4} />
          )}

          {/* Navigation controls */}
          {pageCount > 1 && modules.length > 0 && (
            <div className='swiper-navigation-wrapper'>
              <button className='swiper__btn btn__prev__freelancers'>
                <ArrowLeftLong />
              </button>

              <div className='swiper__pagination swiper__pagination__freelancers'></div>

              <button className='swiper__btn btn__next__freelancers'>
                <ArrowRightLong />
              </button>
            </div>
          )}
        </>
      ) : (
        /* Empty state */
        <div className='row justify-content-center'>
          <div className='col-12 text-center py-5'>
            <div className='empty-state-freelancers'>
              <div className='empty-state-icon mb-3'>
                <IconUsers
                  style={{
                    fontSize: '3rem',
                    color: 'rgba(255, 255, 255, 0.5)',
                  }}
                />
              </div>
              <h4 className='empty-state-title text-white'>
                Δεν βρέθηκαν επαγγελματίες.
              </h4>
              <p className='text-muted mb-3'>
                Δοκιμάστε να ελέγξετε αργότερα ή επικοινωνήστε μαζί μας.
              </p>
              <LinkNP className='ud-btn2 text-white' href='/pros'>
                Όλοι οι Επαγγελματίες
                <ArrowRightLong />
              </LinkNP>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
