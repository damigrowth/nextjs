"use client";

import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation, Pagination } from "swiper";
import { browserCategory } from "@/data/project";
import Link from "next/link";

export default function FeaturedCategoriesSwiper({ categories }) {
  const [showSwiper, setShowSwiper] = useState(false);
  useEffect(() => {
    setShowSwiper(true);
  }, []);
  return (
    <div className="row d-block d-lg-none">
      <div className="col-lg-12">
        <div className="ui-browser wow fadeInUp">
          {showSwiper && (
            <Swiper
              slidesPerView={1}
              navigation={{
                prevEl: ".btn__prev__001",
                nextEl: ".btn__next__001",
              }}
              spaceBetween={30}
              modules={[Navigation, Pagination]}
              className="mySwiper"
              loop={true}
              pagination={{
                el: ".swiper__pagination__001",
                clickable: true,
              }}
              breakpoints={{
                0: {
                  slidesPerView: 1,
                },
                540: {
                  slidesPerView: 2,
                },
              }}
            >
              {categories.map((item, index) => (
                <SwiperSlide key={index}>
                  <div className="item">
                    <div className="iconbox-style1 bdr1">
                      <Link href={`/ipiresies/${item.attributes.slug}`}>
                        <div className="icon">
                          <span className={item.attributes.icon}></span>
                        </div>
                      </Link>
                      <div className="details mt20">
                        {/* <p className="text mb5">{item.skill} skills</p> */}
                        <h4 className="title">
                          <Link href={`/ipiresies/${item.attributes.slug}`}>
                            {item.attributes.label}
                          </Link>
                        </h4>
                        <p className="mb-0">
                          {item.attributes.subcategories.data
                            .slice(0, 3)
                            .map((sub, i) => (
                              <span key={i}>
                                <Link
                                  href={`/ipiresies/${item.attributes.slug}/${sub.attributes.slug}`}
                                >
                                  {sub.attributes.label}
                                </Link>
                                {i < 2 &&
                                i <
                                  item.attributes.subcategories.data.length - 1
                                  ? ", "
                                  : ""}
                              </span>
                            ))}
                        </p>
                      </div>
                    </div>
                  </div>
                  {/* <BrowserCategoryCard1 data={item} /> */}
                </SwiperSlide>
              ))}
            </Swiper>
          )}
        </div>
        <div className="row">
          <div className="col-auto">
            <button className="swiper__btn btn__prev__001">
              <i className="far fa-arrow-left-long" />
            </button>
          </div>
          <div className="col-auto">
            <div className="swiper__pagination swiper__pagination__001"></div>
          </div>
          <div className="col-auto">
            <button className="swiper__btn btn__next__001">
              <i className="far fa-arrow-right-long" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
