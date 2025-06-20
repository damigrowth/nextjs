'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import LinkNP from '@/components/link';
import { Swiper, SwiperSlide, loadSwiperModules } from '@/components/swiper';

import { getImage } from '@/utils/image';
import { getMediaType } from '@/utils/media-validation';

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
    const mediaType = getMediaType(file.mime);
    
    if (mediaType === 'image') {
      // It's an image - use utility for better fallback handling
      const imageData = { data: { attributes: file } };
      const imageUrl = getImage(imageData, { size: 'medium' }) || fallbackImage;

      return (
        <LinkNP href={path}>
          <Image
            height={height || 245}
            width={width || 329}
            style={{
              display: 'block',
              objectFit: 'cover',
              width: width ? `${width}px` : '300px',
              height: height ? `${height}px` : '200px',
            }}
            src={imageUrl}
            alt='service-thumbnail'
          />
        </LinkNP>
      );
    } else if (mediaType === 'video') {
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
      // Fallback (e.g., audio or unknown types)
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
