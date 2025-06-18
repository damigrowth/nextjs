'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Swiper, SwiperSlide, loadSwiperModules } from '@/components/swiper';

import { getBestDimensions } from '@/utils/imageDimensions';

import VideoPreview from './card-video-preview';
import { ArrowLeftLong, ArrowRightLong } from '@/components/icon/fa';

export default function ServiceCardFiles({
  media,
  path,
  width,
  height,
  fontSize,
  isThumbnail,
}) {
  const [modules, setModules] = useState([]);

  useEffect(() => {
    loadSwiperModules().then((loadedModules) => {
      setModules([loadedModules.Navigation, loadedModules.Pagination]);
    });
  }, []);

  const fallbackImage =
    'https://res.cloudinary.com/ddejhvzbf/image/upload/v1750076750/Static/service_ngrppj.webp';

  // Define the slide content rendering logic separately
  const renderSlideContent = (file) => {
    if (file.formats) {
      // It's an image
      return (
        <Link href={path}>
          <Image
            height={height || 245}
            width={width || 329}
            style={{
              display: 'block',
              objectFit: 'cover',
              width: width ? `${width}px` : '300px',
              height: height ? `${height}px` : '200px',
            }}
            src={(() => {
              const formatResult = getBestDimensions(file.formats);

              return formatResult && formatResult.url
                ? formatResult.url
                : fallbackImage;
            })()}
            alt='service-thumbnail'
          />
        </Link>
      );
    } else if (file.mime?.startsWith('video/')) {
      // It's a video
      return (
        <div
          style={{
            width: width ? `${width}px` : '300px',
            height: height ? `${height}px` : '200px',
          }}
        >
          <VideoPreview
            previewUrl={file.previewUrl}
            videoUrl={file.url}
            mime={file.mime}
          />
        </div>
      );
    } else {
      // Fallback (e.g., non-image, non-video, non-audio)
      // Render fallback image without link
      return (
        <Image
          height={height || 245}
          width={width || 329}
          style={{
            display: 'block',
            objectFit: 'cover',
            width: width ? `${width}px` : '300px',
            height: height ? `${height}px` : '200px',
          }}
          src={fallbackImage}
          alt='service-thumbnail'
        />
      );
    }
  };

  return (
    // Remove the outer Link component
    <div className='list-thumb flex-shrink-0 height'>
      <div className='listing-thumbIn-slider position-relative navi_pagi_bottom_center slider-1-grid'>
        {modules.length > 0 ? (
          <Swiper
            navigation={{
              prevEl: '.btn__prev__018',
              nextEl: '.btn__next__018',
            }}
            modules={modules}
            className='mySwiper'
            loop={true}
            pagination={{
              el: '.swiper__pagination__018',
              clickable: true,
            }}
          >
            {media
              .filter((item) => !item.mime?.startsWith('audio/')) // Filter out audio files
              .map(
                (
                  file,
                  index, // Use 'file' object to access all attributes
                ) => (
                  // Render the slide content using the helper function
                  <SwiperSlide key={index}>
                    {renderSlideContent(file)}
                  </SwiperSlide>
                ),
              )}
            <div
              className='swiper__parent'
              style={{ bottom: isThumbnail ? '5px' : undefined }}
            >
              <div className='row justify-content-center flex-nowrap'>
                {!isThumbnail && (
                  <div className='col-auto'>
                    <button className='swiper__btn swiper__btn-2 btn__prev__018'>
                      <ArrowLeftLong />
                    </button>
                  </div>
                )}
                <div className='col-auto'>
                  <div className='swiper__pagination swiper__pagination-2 swiper__pagination__018'></div>
                </div>
                {!isThumbnail && (
                  <div className='col-auto'>
                    <button className='swiper__btn swiper__btn-2 btn__next__018'>
                      <ArrowRightLong />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </Swiper>
        ) : (
          <div
            className='d-flex align-items-center justify-content-center'
            style={{ height: height || '200px' }}
          >
            <div className='spinner-border text-primary' role='status'>
              <span className='visually-hidden'>Loading...</span>
            </div>
          </div>
        )}
      </div>
    </div>
    // Removed closing div from outer Link
  );
}
