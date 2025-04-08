"use client";

import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/navigation";
import "swiper/css/thumbs";
import { FreeMode, Navigation, Thumbs } from "swiper";
import Image from "next/image";
import { getBestDimensions } from "@/utils/imageDimensions";
// MediaPlayer might not be needed anymore if VideoPreview handles all non-image cases
// import { MediaPlayer } from "../media/MediaPlayer";
import { MediaThumb } from "../media/MediaThumb";
import VideoPreview from "../Cards/VideoPreview"; // Import VideoPreview

export default function FeaturedFiles({ files, title, border }) {
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [showSwiper, setShowSwiper] = useState(false);

  useEffect(() => {
    setShowSwiper(true);
  }, []);

  // Filter out audio files before mapping to attributes
  const galleryFiles = files
    .filter((file) => !file.attributes.mime?.startsWith("audio/"))
    .map((file) => file.attributes);

  return (
    <>
      {title && <h4>{title}</h4>}
      <div className="scrollbalance-inner">
        <div className="service-single-sldier vam_nav_style slider-1-grid owl-carousel owl-theme owl-loaded owl-drag">
          <div
            className="thumb px50 py25-sm px30-sm py30"
            // style={{ borderRadius: "20px", overflow: "hidden" }}
          >
            {showSwiper && (
              <Swiper
                loop={true}
                spaceBetween={10}
                navigation={{
                  prevEl: ".prev-btn",
                  nextEl: ".next-btn",
                }}
                thumbs={{
                  swiper:
                    thumbsSwiper && !thumbsSwiper.destroyed
                      ? thumbsSwiper
                      : null,
                }}
                modules={[FreeMode, Navigation, Thumbs]}
                className="mySwiper2"
              >
                {galleryFiles.map((file, i) => {
                  // Map over the full file object
                  if (file.formats) {
                    // Check for image formats
                    const formatResult = getBestDimensions(file.formats);

                    if (!formatResult) {
                      return (
                        <SwiperSlide key={i}>
                          <Image
                            src="/images/fallback/service.png"
                            alt={`gallery-image-${i}`}
                            width={800}
                            height={600}
                            className="big-slide-image"
                          />
                        </SwiperSlide>
                      );
                    }

                    // Image rendering logic (remains the same)
                    const imageWidth = formatResult.width;
                    const imageHeight = formatResult.height;
                    const imageUrl = formatResult.url;

                    return (
                      <SwiperSlide key={i}>
                        <Image
                          src={imageUrl}
                          alt={`gallery-image-${i}`}
                          width={imageWidth}
                          height={imageHeight}
                          className="big-slide-image"
                        />
                      </SwiperSlide>
                    );
                  } else if (file.mime?.startsWith("video/")) {
                    // Check if it's video
                    return (
                      <SwiperSlide key={i}>
                        {/* Render VideoPreview for video files */}
                        <div className="w-100 h-100 d-flex align-items-center justify-content-center">
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
          <button type="button" className="prev-btn">
            <i className="far fa-arrow-left-long" />
          </button>
          <button type="button" className="next-btn">
            <i className="far fa-arrow-right-long" />
          </button>
        </div>
        {showSwiper && (
          <Swiper
            onSwiper={setThumbsSwiper}
            // loop={true}
            spaceBetween={10}
            slidesPerView={4}
            // freeMode={true}
            watchSlidesProgress={true}
            modules={[FreeMode, Navigation, Thumbs]}
            className="mySwiper ui-service-gig-slder-bottom mb60 "
          >
            {galleryFiles.map((file, i) => {
              // Map over full file object for thumbnails too
              if (file.formats) {
                // Check for image formats
                const imageWidth =
                  file.formats?.small?.width || file.formats.thumbnail.width;
                const imageHeight =
                  file.formats?.small?.height || file.formats.thumbnail.height;
                const imageUrl =
                  file.formats?.small?.url || file.formats.thumbnail.url;

                // Image thumbnail rendering (remains the same)
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
              } else if (file.mime?.startsWith("video/")) {
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
