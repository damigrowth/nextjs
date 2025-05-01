"use client";

import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper";

export default function ServicesClientWrapper({
  renderedServiceCards,
  categories,
}) {
  // State for active category
  const [activeCategory, setActiveCategory] = useState("all");

  // Filter services based on active category
  const filteredServices =
    activeCategory === "all"
      ? renderedServiceCards
      : renderedServiceCards.filter(
          (service) => service.categorySlug === activeCategory
        );

  // Calculate some stats
  const itemCount = filteredServices.length;
  const showSwiper = itemCount > 0;

  // Calculate how many slides to show per group based on screen size
  const slidesPerGroup = {
    0: 1, // Mobile: slide 1 at a time
    576: 2, // Tablet: slide 2 at a time
    992: 3, // Small desktop: slide 3 at a time
    1200: 4, // Large desktop: slide 4 at a time
  };

  // Only fix the styling issues with inner Swipers, but allow them to function
  const fixedSwiperCSS = `
    /* Fix container boundaries */
    .service-card-wrapper {
      overflow: hidden;
      height: 100%;
    }
    
    /* Fix inner Swiper dimensions to prevent transform overflow */
    .service-card-wrapper .swiper {
      width: 100% !important;
      overflow: hidden !important;
    }
    
    /* Allow inner Swiper slides to work but keep them contained */
    .service-card-wrapper .swiper-slide {
      width: 100% !important;
      max-width: 100% !important;
    }
    
    /* Ensure inner Swiper wrapper stays contained */
    .service-card-wrapper .swiper-wrapper {
      max-width: 100% !important;
    }
    
    /* Fix inner swiper navigation size and position */
    .service-card-wrapper .swiper__parent {
      position: absolute;
      width: 100%;
      z-index: 10;
    }
    
    .service-card-wrapper .swiper__btn {
      width: 25px;
      height: 25px;
      min-width: 25px;
      min-height: 25px;
      font-size: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    /* Add spacing for pagination controls */
    .service-card-wrapper .list-thumb {
      padding-bottom: 40px;
      position: relative;
    }
    
    /* Style outer swiper */
    .outer-swiper {
      padding-bottom: 5px;
    }
    
    /* Fix z-index for outer navigation */

    
    /* Fix inner pagination dots size */
    .service-card-wrapper .swiper-pagination-bullet {
      width: 6px;
      height: 6px;
    }
    
    /* Equal height cards */
    .outer-swiper .swiper-slide {
      height: auto;
    }
    
    /* Make sure images within the inner swiper don't overflow */
    .service-card-wrapper img {
      max-width: 100%;
      height: auto;
    }
  `;

  return (
    <section className="pt-0 pb100 pt100 bgorange">
      <style dangerouslySetInnerHTML={{ __html: fixedSwiperCSS }} />

      <div className="container">
        <div className="row align-items-center wow fadeInUp">
          <div className="col-xl-3">
            <div className="main-title mb30-lg">
              <h2 className="title">Δημοφιλείς Υπηρεσίες</h2>
              <p className="paragraph">Οι υπηρεσίες με τη μεγαλύτερη ζήτηση.</p>
            </div>
          </div>
          <div className="col-xl-9">
            <div className="navpill-style2 at-home9 mb50-lg nav-container">
              <ul
                className="nav nav-pills mb20 justify-content-xl-end"
                id="pills-tab"
              >
                <li className="nav-item">
                  <button
                    className={`nav-link fw500 dark-color ${
                      activeCategory === "all" ? "active" : ""
                    }`}
                    onClick={() => setActiveCategory("all")}
                  >
                    Όλες οι Υπηρεσίες
                  </button>
                </li>
                {categories.map((category) => (
                  <li key={`cat-label-${category.slug}`} className="nav-item">
                    <button
                      className={`nav-link fw500 dark-color ${
                        activeCategory === category.slug ? "active" : ""
                      }`}
                      onClick={() => setActiveCategory(category.slug)}
                    >
                      {category.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="row wow fadeInUp">
          <div className="col-lg-12">
            <div className="navi_pagi_bottom_center">
              {showSwiper ? (
                <Swiper
                  spaceBetween={24}
                  navigation={{
                    prevEl: ".btn__prev__services",
                    nextEl: ".btn__next__services",
                  }}
                  modules={[Navigation, Pagination]}
                  className="mySwiper outer-swiper"
                  loop={itemCount > 4}
                  pagination={{
                    el: ".swiper__pagination__services",
                    clickable: true,
                  }}
                  breakpoints={{
                    0: {
                      slidesPerView: 1,
                      slidesPerGroup: slidesPerGroup[0],
                    },
                    576: {
                      slidesPerView: Math.min(2, itemCount),
                      slidesPerGroup: Math.min(slidesPerGroup[576], itemCount),
                    },
                    992: {
                      slidesPerView: Math.min(3, itemCount),
                      slidesPerGroup: Math.min(slidesPerGroup[992], itemCount),
                    },
                    1200: {
                      slidesPerView: Math.min(4, itemCount),
                      slidesPerGroup: Math.min(slidesPerGroup[1200], itemCount),
                    },
                  }}
                >
                  {filteredServices.map((service) => (
                    <SwiperSlide key={service.id}>
                      <div className="service-card-wrapper">
                        {service.renderedCard}
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              ) : (
                <div className="row justify-content-center">
                  <div className="col-12 text-center py-5">
                    <p>No services found for this category.</p>
                  </div>
                </div>
              )}
            </div>

            {showSwiper && (
              <div className="row justify-content-center">
                <div className="col-auto">
                  <button className="swiper__btn btn__prev__services">
                    <i className="far fa-arrow-left-long" />
                  </button>
                </div>
                <div className="col-auto">
                  <div className="swiper__pagination swiper__pagination__services"></div>
                </div>
                <div className="col-auto">
                  <button className="swiper__btn btn__next__services">
                    <i className="far fa-arrow-right-long" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
