"use client";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper";
import { useEffect, useState } from "react";
import FreelancerCard from "@/components/ui/Cards/FreelancerCard";

export default function FreelancersList({ freelancers }) {
  const [showSwiper, setShowSwiper] = useState(false);
  useEffect(() => {
    setShowSwiper(true);
  }, []);

  return (
    <div className="navi_pagi_bottom_center">
      {showSwiper && (
        <Swiper
          spaceBetween={30}
          navigation={{
            prevEl: ".btn__prev__013",
            nextEl: ".btn__next__013",
          }}
          modules={[Navigation, Pagination]}
          className="mySwiper"
          loop={false} // Changed to false to prevent repetition
          pagination={{
            el: ".swiper__pagination__013",
            clickable: true,
          }}
          breakpoints={{
            0: {
              slidesPerView: 1,
            },
            768: {
              slidesPerView: 2,
            },
            992: {
              slidesPerView: Math.min(3, freelancers.length), // Don't show more slides than items
            },
            1200: {
              slidesPerView: Math.min(4, freelancers.length), // Don't show more slides than items
            },
          }}
        >
          {freelancers.map((freelancer, index) => (
            <SwiperSlide key={index}>
              <FreelancerCard freelancer={freelancer.attributes} linkedName />
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </div>
  );
}
