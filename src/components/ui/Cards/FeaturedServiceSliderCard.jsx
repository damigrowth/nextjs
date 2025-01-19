"use client";

import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation, Pagination } from "swiper";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import UserImage from "@/components/user/UserImage";
import { formatRating } from "@/utils/formatRating";
import { getBestDimensions } from "@/utils/imageDimensions";

export default function FeaturedServiceSliderCard({ service }) {
  const { media, category, title, slug, freelancer, price } = service;

  const freelancerData = freelancer.data.attributes;

  const {
    username,
    firstName,
    lastName,
    displayName,
    image: avatar,
    rating,
    reviews_total,
  } = freelancerData;

  const [showSwiper, setShowSwiper] = useState(false);

  const mediaUrls = media.data.map(
    (img) => getBestDimensions(img.attributes.formats).url
  );

  useEffect(() => {
    setShowSwiper(true);
  }, []);

  return (
    <>
      <div className="listing-style1 default-box-shadow1 bdrs16">
        <div className="list-thumb">
          <div className="listing-thumbIn-slider position-relative navi_pagi_bottom_center slider-1-grid">
            <div className="item">
              <Link href={`/s/${slug}`}>
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
                    {mediaUrls.map((url, index) => (
                      <SwiperSlide key={index}>
                        <Image
                          height={247}
                          width={331}
                          className="w-100 object-fit-cover"
                          src={url}
                          alt="thumbnail"
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
              </Link>

              {/* <a
              onClick={() => setFavActive(!isFavActive)}
              className={`listing-fav fz12 z-1 ${
                isFavActive ? "ui-fav-active" : ""
              }`}
            >
              <span className="far fa-heart" />
            </a> */}
            </div>
          </div>
        </div>
        <div className="list-content">
          <p className="list-text body-color fz14 mb-1">
            {category?.data?.attributes?.label}
          </p>
          <h5 className="service-card-title">
            <Link href={`/s/${slug}`}>
              {title.length > 60 ? `${title.slice(0, 60)}...` : title}
            </Link>
          </h5>
          <div className="review-meta d-flex align-items-center">
            {reviews_total && (
              <>
                <i className="fas fa-star fz10 review-color me-2" />
                <p className="mb-0 body-color fz14">
                  <span className="dark-color me-2">
                    {formatRating(rating)}
                  </span>
                  {reviews_total > 1
                    ? `(${reviews_total} αξιολογήσεις)`
                    : `(${reviews_total} αξιολόγηση)`}
                </p>
              </>
            )}
          </div>
          <hr className="my-2" />
          <div className="list-meta d-flex justify-content-between align-items-center mt15">
            <UserImage
              image={
                avatar?.data?.attributes?.formats?.thumbnail?.url ||
                "/Avatar.png"
              }
              width={30}
              height={30}
              firstName={firstName}
              lastName={lastName}
              displayName={displayName}
              path={`/profile/${username}`}
            />
            {price > 0 && (
              <div className="budget">
                <p className="mb-0 body-color">
                  από
                  <span className="fz17 fw500 dark-color ms-1">{price}€</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
