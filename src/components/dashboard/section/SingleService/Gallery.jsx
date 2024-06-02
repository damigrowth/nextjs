"use client";

import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/navigation";
import "swiper/css/thumbs";
import { FreeMode, Navigation, Thumbs } from "swiper";
import Image from "next/image";

const gigImages = [
  "/images/listings/service-details-1.jpg",
  "/images/listings/service-details-1.jpg",
  "/images/listings/service-details-1.jpg",
];

export default function Gallery({ images }) {
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [showSwiper, setShowSwiper] = useState(false);

  useEffect(() => {
    setShowSwiper(true);
  }, []);

  const galleryImages = images.map((image) => image.attributes.formats);

  const getBestDimensions = (formats) => {
    if (formats.medium) {
      return formats.medium;
    }
    if (formats.small) {
      return formats.small;
    }
    return formats.thumbnail;
  };

  return (
    <>
      <div className="scrollbalance-inner">
        <div className="service-single-sldier vam_nav_style slider-1-grid owl-carousel owl-theme mb60 owl-loaded owl-drag">
          <div className="thumb p50 p30-sm">
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
                {galleryImages.map((formats, i) => {
                  const image = getBestDimensions(formats);
                  return (
                    <SwiperSlide key={i}>
                      <Image
                        height={image.height}
                        width={image.width}
                        src={image.url}
                        alt={`gallery-image-${i}`}
                        className="w-100 h-auto"
                      />
                    </SwiperSlide>
                  );
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
          {showSwiper && (
            <Swiper
              onSwiper={setThumbsSwiper}
              loop={true}
              spaceBetween={10}
              slidesPerView={4}
              freeMode={true}
              watchSlidesProgress={true}
              modules={[FreeMode, Navigation, Thumbs]}
              className="mySwiper ui-service-gig-slder-bottom"
            >
              {galleryImages.map((image, i) => (
                <SwiperSlide key={i}>
                  <Image
                    height={image.thumbnail.height}
                    width={image.thumbnail.width}
                    src={image.thumbnail.url}
                    alt={`gallery-thumb-image-${image.thumbnail.name}`}
                    className="w-100"
                    style={{ height: "inherit" }}
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          )}
        </div>
      </div>
    </>
  );
}
