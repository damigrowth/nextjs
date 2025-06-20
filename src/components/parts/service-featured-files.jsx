'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Swiper, SwiperSlide, loadSwiperModules } from '@/components/swiper';

import { getImage } from '@/utils/image';
import { getMediaType } from '@/utils/media-validation';

import { MediaThumb, VideoPreview } from '../card';
import { ArrowLeftLong, ArrowRightLong } from '@/components/icon/fa';

export default function FeaturedFiles({ files, title, border }) {
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [showSwiper, setShowSwiper] = useState(false);
  const [modules, setModules] = useState([]);

  useEffect(() => {
    loadSwiperModules().then((loadedModules) => {
      setModules([
        loadedModules.FreeMode,
        loadedModules.Navigation,
        loadedModules.Thumbs,
      ]);
      setShowSwiper(true);
    });
  }, []);

  // Filter out audio files before mapping to attributes
  const galleryFiles = files
    .filter((file) => !file.attributes.mime?.startsWith('audio/'))
    .map((file) => file.attributes);

  return (
    <>
      {title && <h4>{title}</h4>}
      <div className='scrollbalance-inner'>
        <div className='service-single-sldier vam_nav_style slider-1-grid owl-carousel owl-theme owl-loaded owl-drag'>
          <div
            className='thumb px50 py25-sm px30-sm py30'
            // style={{ borderRadius: "20px", overflow: "hidden" }}
          >
            {showSwiper && modules.length > 0 && (
              <Swiper
                loop={true}
                spaceBetween={10}
                navigation={{
                  prevEl: '.prev-btn',
                  nextEl: '.next-btn',
                }}
                thumbs={{
                  swiper:
                    thumbsSwiper && !thumbsSwiper.destroyed
                      ? thumbsSwiper
                      : null,
                }}
                modules={modules}
                className='mySwiper2'
              >
                {galleryFiles.map((file, i) => {
                  // Map over the full file object
                  const mediaType = getMediaType(file.mime);
                  
                  if (mediaType === 'image') {
                    // Create imageData structure that our utility expects
                    const imageData = { data: { attributes: file } };
                    const imageUrl = getImage(imageData, { size: 'card' });
                    
                    if (!imageUrl) {
                      return (
                        <SwiperSlide key={i}>
                          <Image
                            src='https://res.cloudinary.com/ddejhvzbf/image/upload/v1750076750/Static/service_ngrppj.webp'
                            alt={`gallery-image-${i}`}
                            width={800}
                            height={600}
                            className='big-slide-image'
                          />
                        </SwiperSlide>
                      );
                    }

                    // Get the best image data including dimensions
                    const imageData_full = getImage(imageData, { size: 'large', returnType: 'full' });
                    const imageWidth = imageData_full?.width || 800;
                    const imageHeight = imageData_full?.height || 600;

                    return (
                      <SwiperSlide key={i}>
                        <Image
                          src={imageUrl}
                          alt={`gallery-image-${i}`}
                          width={imageWidth}
                          height={imageHeight}
                          className='big-slide-image'
                        />
                      </SwiperSlide>
                    );
                  } else if (mediaType === 'video') {
                    // Check if it's video
                    return (
                      <SwiperSlide key={i}>
                        {/* Render VideoPreview for video files */}
                        <div className='w-100 h-100 d-flex align-items-center justify-content-center'>
                          <VideoPreview
                            previewUrl={file.previewUrl} // Access properties from file
                            videoUrl={file.url} // Access properties from file
                            mime={file.mime} // Access properties from file
                          />
                        </div>
                      </SwiperSlide>
                    );
                  } else {
                    // Fallback for non-image, non-video (already filtered audio)
                    // Render nothing or a placeholder image
                    return null; // Or potentially a fallback image slide
                  }
                })}
              </Swiper>
            )}
          </div>
          <button type='button' className='prev-btn'>
            <ArrowLeftLong />
          </button>
          <button type='button' className='next-btn'>
            <ArrowRightLong />
          </button>
        </div>
        {showSwiper && modules.length > 0 && (
          <Swiper
            onSwiper={setThumbsSwiper}
            // loop={true}
            spaceBetween={10}
            slidesPerView={4}
            // freeMode={true}
            watchSlidesProgress={true}
            modules={modules}
            className='mySwiper ui-service-gig-slder-bottom mb60 '
          >
            {galleryFiles.map((file, i) => {
              // Map over full file object for thumbnails too
              const mediaType = getMediaType(file.mime);
              
              if (mediaType === 'image') {
                // Create imageData structure for thumbnails
                const imageData = { data: { attributes: file } };
                const imageUrl = getImage(imageData, { size: 'card' });
                
                if (!imageUrl) {
                  return null;
                }
                
                // Get the best image data including dimensions for thumbnails
                const imageData_full = getImage(imageData, { size: 'small', returnType: 'full' });
                const imageWidth = imageData_full?.width || 150;
                const imageHeight = imageData_full?.height || 150;

                // Image thumbnail rendering
                return (
                  <SwiperSlide key={i}>
                    <Image
                      src={imageUrl}
                      alt={`gallery-image-${i}`}
                      width={imageWidth}
                      height={imageHeight}
                    />
                  </SwiperSlide>
                );
              } else if (mediaType === 'video') {
                // Check for video
                return (
                  <SwiperSlide key={i}>
                    {/* Pass previewUrl and mime to MediaThumb */}
                    <MediaThumb
                      url={file.url}
                      mime={file.mime}
                      previewUrl={file.previewUrl} // Pass previewUrl
                    />
                  </SwiperSlide>
                );
              } else {
                // Fallback for non-image, non-video in thumbnails
                return null;
              }
            })}
          </Swiper>
        )}
      </div>
    </>
  );
}
