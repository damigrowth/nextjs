"use client";

import React from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation, Pagination } from "swiper";
import Image from "next/image";
import { getBestDimensions } from "@/utils/imageDimensions";
import { MediaThumb } from "../media/MediaThumb";

export default function ServiceCardFiles({
  media,
  path,
  width,
  height,
  fontSize,
  isThumbnail,
}) {
  const fallbackImage = "/images/fallback/service.png";

  return (
    <Link href={path}>
      <div className="list-thumb flex-shrink-0 height">
        <div className="listing-thumbIn-slider position-relative navi_pagi_bottom_center slider-1-grid">
          <Swiper
            navigation={{
              prevEl: ".btn__prev__018",
              nextEl: ".btn__next__018",
            }}
            modules={[Navigation, Pagination]}
            className="mySwiper"
            loop={true}
            pagination={{
              el: ".swiper__pagination__018",
              clickable: true,
            }}
          >
            {media.map(({ formats, url }, index) => (
              <SwiperSlide key={index}>
                {formats ? (
                  <Image
                    height={height || 245}
                    width={width || 329}
                    style={{
                      display: "block",
                      objectFit: "cover",
                      width: width ? `${width}px` : "300px",
                      height: height ? `${height}px` : "200px",
                    }}
                    src={
                      (() => {
                        const formatResult = getBestDimensions(formats);
                        return formatResult && formatResult.url
                          ? formatResult.url
                          : fallbackImage;
                      })()
                    }
                    alt="service-thumbnail"
                  />
                ) : (
                  <>
                    {isThumbnail ? (
                      <MediaThumb
                        url={url}
                        width={width}
                        height={height}
                        fontSize={fontSize}
                      />
                    ) : (
                      <video controls preload="none">
                        <source src={url} type="video/mp4" />.
                      </video>
                    )}
                  </>
                )}
              </SwiperSlide>
            ))}
            <div
              className="swiper__parent"
              style={{ bottom: isThumbnail ? "5px" : undefined }}
            >
              <div className="row justify-content-center">
                {!isThumbnail && (
                  <div className="col-auto">
                    <button className="swiper__btn swiper__btn-2 btn__prev__018">
                      <i className="far fa-arrow-left-long" />
                    </button>
                  </div>
                )}

                <div className="col-auto">
                  <div className="swiper__pagination swiper__pagination-2 swiper__pagination__018"></div>
                </div>

                {!isThumbnail && (
                  <div className="col-auto">
                    <button className="swiper__btn swiper__btn-2 btn__next__018">
                      <i className="far fa-arrow-right-long" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </Swiper>
        </div>
      </div>
    </Link>
  );
}
