'use client';

import 'swiper/css';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { IconAngleRight } from '@/components/icon/fa';

/**
 * Renders a Swiper component for displaying a list of taxonomies (subdivisions).
 * It shows a horizontal scrollable list of links to specific taxonomy pages.
 *
 * @param {Object} props - The component props.
 * @param {Array<Object>} props.taxonomies - An array of taxonomy objects to display in the swiper.
 *   Each object should have `slug`, `label`, and `subcategory.data.attributes.slug`.
 * @returns {JSX.Element} The TaxonomiesSwiper component.
 */
export default function TaxonomiesSwiper({ taxonomies }) {
  const [swiperLoaded, setSwiperLoaded] = useState(false);

  useEffect(() => {
    setSwiperLoaded(true);
  }, []);

  return (
    <section className='pb30 pt25'>
      <div className='container taxonomies-swiper'>
        <h2 className='mb20'>Πιο δημοφιλείς εργασίες</h2>
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
            {taxonomies &&
              taxonomies.map((taxonomy, i) => (
                <SwiperSlide key={i}>
                  <Link
                    href={`/ipiresies/${taxonomy.subcategory.data.attributes.slug}/${taxonomy.slug}`}
                    className='taxonomies-swiper-card'
                  >
                    <span>{taxonomy.label}</span>
                    <IconAngleRight />
                  </Link>
                </SwiperSlide>
              ))}
          </Swiper>
        )}
      </div>
    </section>
  );
}
