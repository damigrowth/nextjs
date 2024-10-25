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

export default function FeaturedFiles({ files, title, border }) {
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [showSwiper, setShowSwiper] = useState(false);

  useEffect(() => {
    setShowSwiper(true);
  }, []);

  const galleryFiles = files.map((image) => image.attributes);

  console.log("formats", galleryFiles);

  return (
    <>
      {title && <h4>{title}</h4>}
      <div className="scrollbalance-inner">
        <div className="service-single-sldier vam_nav_style slider-1-grid owl-carousel owl-theme owl-loaded owl-drag">
          <div
            className="thumb"
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
                {galleryFiles.map(({ formats, url }, i) => {
                  if (formats) {
                    const imageWidth = getBestDimensions(formats).width;
                    const imageHeight = getBestDimensions(formats).height;
                    const imageUrl = getBestDimensions(formats).url;

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
                  } else {
                    return (
                      <SwiperSlide key={i}>
                        <video controls preload="none">
                          <source src={url} type="video/mp4" />.
                        </video>
                      </SwiperSlide>
                    );
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
            {galleryFiles.map(({ formats, url }, i) => {
              if (formats) {
                console.log(formats);

                const imageWidth = formats.small.width;
                const imageHeight = formats.small.height;
                const imageUrl = formats.small.url;

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
              } else {
                return (
                  <SwiperSlide key={i}>
                    <div
                      style={{
                        position: "relative",
                        width: "300px",
                        height: "300px",
                        backgroundColor: "#404040",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        cursor: "pointer",
                      }}
                    >
                      <i
                        className="fas fa-video"
                        style={{
                          fontSize: "48px",
                          color: "white",
                          opacity: 0.8,
                        }}
                      ></i>
                    </div>
                  </SwiperSlide>
                );
              }
            })}
          </Swiper>
        )}
      </div>
      {border && <hr className="opacity-100 mb60 mt60" />}
    </>
  );
}
