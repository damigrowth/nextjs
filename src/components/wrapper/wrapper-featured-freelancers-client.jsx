'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';
import { Swiper, SwiperSlide, loadSwiperModules } from '@/components/swiper';
import LinkNP from '@/components/link';
import { ArrowLeftLong, ArrowRightLong, IconUsers } from '@/components/icon/fa';

let swiperModules = null;
const getSwiperModules = async () => {
  if (!swiperModules) {
    swiperModules = await loadSwiperModules();
  }
  return swiperModules;
};

/**
 * @typedef {object} FreelancersClientWrapperProps
 * @property {Array<object>} renderedFreelancerCards - Pre-rendered freelancer cards from the server component.
 * @property {object} pagination - Pagination information including page, pageCount, pageSize, and total.
 */

/**
 * FreelancersClientWrapper component provides client-side interactivity for featured freelancers,
 * including Swiper-based pagination.
 * @param {FreelancersClientWrapperProps} props - The component props.
 * @returns {JSX.Element} The JSX element for the freelancers client wrapper.
 */
export default function FreelancersClientWrapper({
  renderedFreelancerCards,
  pagination,
}) {
  const swiperRef = useRef(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  const [modules, setModules] = useState([]);

  const filteredFreelancers = renderedFreelancerCards;

  const currentPage = pagination?.page || 1;
  const pageCount = pagination?.pageCount || 1;

  // Load Swiper modules on component mount
  useEffect(() => {
    getSwiperModules().then((loadedModules) => {
      setModules([loadedModules.Navigation, loadedModules.Pagination]);
    });
  }, []);

  const handleSlideChange = (swiper) => {
    const newPage = swiper.activeIndex + 1;
    if (newPage !== currentPage) {
      handlePageChange(newPage);
    }
  };

  const handlePageChange = (newPage) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    current.set('fp', newPage.toString());

    const query = current.toString();
    router.push(`/?${query}`, { scroll: false });
  };

  useEffect(() => {
    if (
      swiperRef.current &&
      swiperRef.current.activeIndex !== currentPage - 1
    ) {
      swiperRef.current.slideTo(currentPage - 1, 0);
    }
  }, [currentPage]);

  const createDataPageSlides = () => {
    const slides = [];

    if (filteredFreelancers.length === 0) {
      return slides;
    }

    for (let page = 1; page <= pageCount; page++) {
      slides.push(
        <SwiperSlide key={`page-${page}`}>
          <div className='freelancers-page-content'>
            {page === currentPage ? (
              <div className='row'>
                {filteredFreelancers.map((freelancer) => (
                  <div
                    key={freelancer.id}
                    className='col-xl-3 col-lg-4 col-md-6 col-sm-12 mb-4'
                  >
                    <div className='freelancer-card-wrapper'>
                      {freelancer.renderedCard}
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
    <div className='navi_pagi_bottom_center_freelancers'>
      {filteredFreelancers.length > 0 ? (
        <>
          {modules.length > 0 ? (
            <Swiper
              {...swiperConfig}
              modules={modules}
              className='mySwiper outer-swiper-freelancers'
            >
              {dataPageSlides}
            </Swiper>
          ) : (
            <div className='text-center py-5'>
              <div className='spinner-border text-thm2' role='status'>
                <span className='visually-hidden'>Loading...</span>
              </div>
            </div>
          )}

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
              <h4 className='empty-state-title'>Δεν βρέθηκαν επαγγελματίες.</h4>
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
