'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import LinkNP from '@/components/link';
import { Swiper, SwiperSlide, loadSwiperModules } from '@/components/swiper';

import { getBestDimensions } from '@/utils/imageDimensions';

import VideoPreview from './card-video-preview';
import { ArrowLeftLong, ArrowRightLong } from '@/components/icon/fa';

export default function ServiceSlideCardMedia({ media, path }) {
  const [showSwiper, setShowSwiper] = useState(false);
  const [modules, setModules] = useState([]);

  const fallbackImage =
    'https://res.cloudinary.com/ddejhvzbf/image/upload/v1750076750/Static/service_ngrppj.webp';

  // Re-introduce filtering to exclude audio files
  const displayMedia = media.data.filter(
    (item) => !item.attributes.mime?.startsWith('audio/'),
  );

  useEffect(() => {
    loadSwiperModules().then((loadedModules) => {
      setModules([loadedModules.Navigation, loadedModules.Pagination]);
      setShowSwiper(true);
    });
  }, []);

  return (
    <>
      {showSwiper && modules.length > 0 && (
        <Swiper
          navigation={{
            prevEl: '.btn__prev__005',
            nextEl: '.btn__next__005',
          }}
          modules={modules}
          className='mySwiper'
          loop={true}
          pagination={{
            el: '.swiper__pagination__005',
            clickable: true,
          }}
        >
          {displayMedia.map((file, index) => {
            const attributes = file.attributes;

            let slideContent;

            if (attributes.formats) {
              // It's an image - Wrap with Link
              const formatResult = getBestDimensions(attributes.formats);

              slideContent = (
                <LinkNP href={path || '#'}>
                  {' '}
                  {/* Add Link wrapper, provide fallback href */}
                  <Image
                    height={247}
                    width={331}
                    className='w-100 object-fit-cover'
                    src={formatResult?.url || fallbackImage}
                    alt='thumbnail'
                    style={{ objectFit: 'cover', height: '247px' }} // Ensure consistent height
                  />
                </LinkNP>
              );
            } else if (attributes.mime?.startsWith('video/')) {
              // Only check for video now
              // It's a video
              slideContent = (
                <div style={{ width: '331px', height: '247px' }}>
                  {/* Container with dimensions */}
                  <VideoPreview
                    previewUrl={attributes.previewUrl}
                    videoUrl={attributes.url}
                    mime={attributes.mime}
                  />
                </div>
              );
            } else {
              // Fallback for other types
              slideContent = (
                <Image
                  height={247}
                  width={331}
                  className='w-100 object-fit-cover'
                  src={fallbackImage}
                  alt='thumbnail'
                  style={{ objectFit: 'cover', height: '247px' }}
                />
              );
            }

            return <SwiperSlide key={index}>{slideContent}</SwiperSlide>;
          })}
          <div className='swiper__parent'>
            <div className='row justify-content-center'>
              <div className='col-auto'>
                <button className='swiper__btn swiper__btn-2 btn__prev__005'>
                  <ArrowLeftLong />
                </button>
              </div>
              <div className='col-auto'>
                <div className='swiper__pagination swiper__pagination-2 swiper__pagination__005'></div>
              </div>
              <div className='col-auto'>
                <button className='swiper__btn swiper__btn-2 btn__next__005'>
                  <ArrowRightLong />
                </button>
              </div>
            </div>
          </div>
        </Swiper>
      )}
      {!showSwiper && (
        <div
          className='d-flex align-items-center justify-content-center'
          style={{ height: '247px' }}
        >
          <div className='spinner-border text-primary' role='status'>
            <span className='visually-hidden'>Loading...</span>
          </div>
        </div>
      )}
    </>
  );
}
