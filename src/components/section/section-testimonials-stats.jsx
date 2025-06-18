'use client';

import React, { useEffect, useState } from 'react';
import { Swiper, SwiperSlide, loadSwiperModules } from '@/components/swiper';

import { testimonials } from '../../constants/data';
import TestimonialCard from '../card/card-testimonial';
import { ArrowLeftLong, ArrowRightLong } from '@/components/icon/fa';

export default function Testimonials() {
  const [showSwiper, setShowSwiper] = useState(false);
  const [modules, setModules] = useState([]);

  useEffect(() => {
    loadSwiperModules().then((loadedModules) => {
      setModules([loadedModules.Navigation, loadedModules.Pagination]);
      setShowSwiper(true);
    });
  }, []);

  return (
    <div className='col-md-6 col-lg-4 col-xl-4'>
      <div
        className='ui-hightest-rated mb15 wow fadeInUp'
        data-wow-delay='300ms'
      >
        {showSwiper && modules.length > 0 && (
          <Swiper
            slidesPerView={1}
            spaceBetween={30}
            navigation={{
              prevEl: '.btn__prev__003',
              nextEl: '.btn__next__003',
            }}
            modules={modules}
            className='mySwiper'
            loop={true}
            pagination={{
              el: '.swiper__pagination__003',
              clickable: true,
            }}
          >
            {testimonials.map((item, index) => (
              <SwiperSlide key={index}>
                <TestimonialCard
                  title={item.title}
                  comment={item.comment}
                  image={item.image}
                  displayName={item.name}
                  category={item.category}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </div>
      <div className='row justify-content-center'>
        <div className='col-auto'>
          <button className='swiper__btn btn__prev__003'>
            <ArrowLeftLong />
          </button>
        </div>
        <div className='col-auto'>
          <div className='swiper__pagination swiper__pagination__003'></div>
        </div>
        <div className='col-auto'>
          <button className='swiper__btn btn__next__003'>
            <ArrowRightLong />
          </button>
        </div>
      </div>
    </div>
  );
}
