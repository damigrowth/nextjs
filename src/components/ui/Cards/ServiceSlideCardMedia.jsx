"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { getBestDimensions } from "@/utils/imageDimensions";

export default function ServiceSlideCardMedia({ media }) {
  const [showSwiper, setShowSwiper] = useState(false);

  const mediaUrls = media.data.map((img) =>
    getBestDimensions(img.attributes.formats)
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
          {mediaUrls.map((el, index) => (
            <SwiperSlide key={index}>
              <Image
                height={247}
                width={331}
                className="w-100 object-fit-cover"
                src={el?.url || "/images/fallback/service.png"}
                alt="thumbnail"
                style={{ objectFit: "cover" }}
              />
            </SwiperSlide>
          ))}
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
