'use client';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Navigation, Pagination } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';

import { getBestDimensions } from '@/utils/imageDimensions';

import VideoPreview from './card-video-preview';
import { ArrowLeftLong, ArrowRightLong } from '@/components/icon/fa';
// Import the new component

export default function ServiceCardFiles({
  media,
  path,
  width,
  height,
  fontSize,
  isThumbnail,
}) {
  const fallbackImage = '/images/fallback/service.png';

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
        <Swiper
          navigation={{
            prevEl: '.btn__prev__018',
            nextEl: '.btn__next__018',
          }}
          modules={[Navigation, Pagination]}
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
      </div>
    </div>
    // Removed closing div from outer Link
  );
}
