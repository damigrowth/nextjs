"use client";

import React from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation, Pagination } from "swiper";
import Image from "next/image";

export default function ServiceCardMedia({ media }) {
  if (media.length > 1) {
    return (
      <div className="list-thumb flex-shrink-0 height">
        <Image
          height={245}
          width={329}
          className="w-100 h-100 object-fit-cover"
          src={media[0].attributes.formats.thumbnail.url}
          alt="image"
        />
      </div>
    );
  } else {
    return (
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
            {media.map((item, index) => (
              <SwiperSlide key={index}>
                <Image
                  height={245}
                  width={329}
                  className="w-100 h-100 object-fit-cover"
                  src={item.attributes.formats.thumbnail.url}
                  alt="thumbnail"
                />
              </SwiperSlide>
            ))}
            <div className="swiper__parent">
              <div className="row justify-content-center">
                <div className="col-auto">
                  <button className="swiper__btn swiper__btn-2 btn__prev__018">
                    <i className="far fa-arrow-left-long" />
                  </button>
                </div>
                <div className="col-auto">
                  <div className="swiper__pagination swiper__pagination-2 swiper__pagination__018"></div>
                </div>
                <div className="col-auto">
                  <button className="swiper__btn swiper__btn-2 btn__next__018">
                    <i className="far fa-arrow-right-long" />
                  </button>
                </div>
              </div>
            </div>
          </Swiper>
        </div>
      </div>
    );
  }
}
