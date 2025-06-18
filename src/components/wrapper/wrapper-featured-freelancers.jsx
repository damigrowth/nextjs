'use client';

import React, { useEffect, useState } from 'react';
import { Swiper, SwiperSlide, loadSwiperModules } from '@/components/swiper';

export default function FreelancersListWrapper({
  children,
  spaceBetween = 30,
  loop = false,
  slidesPerView = {
    0: 1,
    768: 2,
    992: 3,
    1200: 4,
  },
  navigationClass = {
    prev: 'btn__prev__013',
    next: 'btn__next__013',
  },
  paginationClass = 'swiper__pagination__013',
}) {
  const [showSwiper, setShowSwiper] = useState(false);
  const [modules, setModules] = useState([]);

  useEffect(() => {
    loadSwiperModules().then((loadedModules) => {
      setModules([loadedModules.Navigation, loadedModules.Pagination]);
      setShowSwiper(true);
    });
  }, []);

  const itemCount = React.Children.count(children);

  return (
    <div className='navi_pagi_bottom_center'>
      {showSwiper && modules.length > 0 && (
        <Swiper
          spaceBetween={spaceBetween}
          navigation={{
            prevEl: `.${navigationClass.prev}`,
            nextEl: `.${navigationClass.next}`,
          }}
          modules={modules}
          className='mySwiper'
          loop={loop && itemCount > slidesPerView[1200]}
          pagination={{
            el: `.${paginationClass}`,
            clickable: true,
          }}
          breakpoints={{
            0: {
              slidesPerView: slidesPerView[0],
            },
            768: {
              slidesPerView: Math.min(slidesPerView[768], itemCount),
            },
            992: {
              slidesPerView: Math.min(slidesPerView[992], itemCount),
            },
            1200: {
              slidesPerView: Math.min(slidesPerView[1200], itemCount),
            },
          }}
        >
          {React.Children.map(children, (child, index) => (
            <SwiperSlide key={index}>{child}</SwiperSlide>
          ))}
        </Swiper>
      )}
    </div>
  );
}
