"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

export default function TaxonomiesSwiper({ taxonomies }) {
  const [swiperLoaded, setSwiperLoaded] = useState(false);

  useEffect(() => {
    setSwiperLoaded(true);
  }, []);

  return (
    <section>
      <div className="container taxonomies-swiper">
        <h2 className="mb40">Ποιο δημοφιλής κατηγορίες</h2>
        {swiperLoaded && (
          <Swiper
            spaceBetween={15}
            breakpoints={{
              640: {
                slidesPerView: 2,
              },
              768: {
                slidesPerView: 3,
              },
              1024: {
                slidesPerView: 5.2,
              },
            }}
          >
            {taxonomies.map((taxonomy, i) => (
              <SwiperSlide key={i}>
                <Link
                  href={`/ipiresies/${taxonomy.category.data.attributes.slug}/${taxonomy.subcategory.data.attributes.slug}/${taxonomy.slug}`}
                  className="taxonomies-swiper-card"
                >
                  <span>{taxonomy.label}</span>
                  <span className="fas fa-angle-right"></span>
                </Link>
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </div>
    </section>
  );
}
