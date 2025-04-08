"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { getBestDimensions } from "@/utils/imageDimensions";
import VideoPreview from "./VideoPreview"; // Import VideoPreview
import Link from "next/link"; // Import Link

export default function ServiceSlideCardMedia({ media, path }) {
  // Add path prop
  const [showSwiper, setShowSwiper] = useState(false);
  const fallbackImage = "/images/fallback/service.png"; // Define fallback

  // Re-introduce filtering to exclude audio files
  const displayMedia = media.data.filter(
    (item) => !item.attributes.mime?.startsWith("audio/")
  );

  useEffect(() => {
    setShowSwiper(true);
  }, []);

  return (
    <>
      {showSwiper && (
        <Swiper
          navigation={{
            prevEl: ".btn__prev__005",
            nextEl: ".btn__next__005",
          }}
          modules={[Navigation, Pagination]}
          className="mySwiper"
          loop={true}
          pagination={{
            el: ".swiper__pagination__005",
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
                <Link href={path || "#"}>
                  {" "}
                  {/* Add Link wrapper, provide fallback href */}
                  <Image
                    height={247}
                    width={331}
                    className="w-100 object-fit-cover"
                    src={formatResult?.url || fallbackImage}
                    alt="thumbnail"
                    style={{ objectFit: "cover", height: "247px" }} // Ensure consistent height
                  />
                </Link>
              );
            } else if (attributes.mime?.startsWith("video/")) {
              // Only check for video now
              // It's a video
              slideContent = (
                <div style={{ width: "331px", height: "247px" }}>
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
                  className="w-100 object-fit-cover"
                  src={fallbackImage}
                  alt="thumbnail"
                  style={{ objectFit: "cover", height: "247px" }}
                />
              );
            }

            return <SwiperSlide key={index}>{slideContent}</SwiperSlide>;
          })}
          <div className="swiper__parent">
            <div className="row justify-content-center">
              <div className="col-auto">
                <button className="swiper__btn swiper__btn-2 btn__prev__005">
                  <i className="far fa-arrow-left-long" />
                </button>
              </div>
              <div className="col-auto">
                <div className="swiper__pagination swiper__pagination-2 swiper__pagination__005"></div>
              </div>
              <div className="col-auto">
                <button className="swiper__btn swiper__btn-2 btn__next__005">
                  <i className="far fa-arrow-right-long" />
                </button>
              </div>
            </div>
          </div>
        </Swiper>
      )}
    </>
  );
}
