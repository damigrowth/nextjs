'use client';

import React, { useEffect, useState } from 'react';
import LinkNP from '@/components/link';
import { Swiper, SwiperSlide, loadSwiperModules } from '@/components/swiper';
import { ArrowLeftLong, ArrowRightLong } from '@/components/icon/fa';

export default function FeaturedCategoriesSwiper({ categories }) {
  const [showSwiper, setShowSwiper] = useState(false);
  const [modules, setModules] = useState([]);

  useEffect(() => {
    loadSwiperModules().then((loadedModules) => {
      setModules([loadedModules.Navigation, loadedModules.Pagination]);
      setShowSwiper(true);
    });
  }, []);

  return (
    <div className='row d-block d-lg-none'>
      <div className='col-lg-12'>
        <div className='ui-browser wow fadeInUp pb20'>
          {showSwiper && modules.length > 0 && (
            <Swiper
              slidesPerView={1}
              navigation={{
                prevEl: '.btn__prev__001',
                nextEl: '.btn__next__001',
              }}
              spaceBetween={30}
              modules={modules}
              className='mySwiper'
              loop={true}
              pagination={{
                el: '.swiper__pagination__001',
                clickable: true,
              }}
              breakpoints={{
                0: {
                  slidesPerView: 1,
                },
                540: {
                  slidesPerView: 2,
                },
              }}
            >
              {categories.map((item, index) => (
                <SwiperSlide key={index}>
                  <div className='item'>
                    <div className='iconbox-style1 bdr1 default-box-shadow3'>
                      <LinkNP href={`/categories/${item.attributes.slug}`}>
                        <div className='icon'>
                          <span className={item.attributes.icon}></span>
                        </div>
                      </LinkNP>
                      <div className='details mt20'>
                        {/* <p className="text mb5">{item.skill} skills</p> */}
                        <h4 className='title'>
                          <LinkNP href={`/categories/${item.attributes.slug}`}>
                            {item.attributes.label}
                          </LinkNP>
                        </h4>
                        <p className='mb-0'>
                          {item.attributes.subcategories.data
                            .slice(0, 3)
                            .map((sub, i) => (
                              <span key={i}>
                                <LinkNP
                                  href={`/ipiresies/${sub.attributes.slug}`}
                                >
                                  {sub.attributes.label}
                                </LinkNP>
                                {i < 2 &&
                                i <
                                  item.attributes.subcategories.data.length - 1
                                  ? ', '
                                  : ''}
                              </span>
                            ))}
                        </p>
                      </div>
                    </div>
                  </div>
                  {/* <BrowserCategoryCard1 data={item} /> */}
                </SwiperSlide>
              ))}
            </Swiper>
          )}
        </div>
        <div className='row'>
          <div className='col-auto'>
            <button className='swiper__btn btn__prev__001'>
              <ArrowLeftLong />
            </button>
          </div>
          <div className='col-auto'>
            <div className='swiper__pagination swiper__pagination__001'></div>
          </div>
          <div className='col-auto'>
            <button className='swiper__btn btn__next__001'>
              <ArrowRightLong />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
