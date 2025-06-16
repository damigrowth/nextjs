import React from 'react';
import Image from 'next/image';

import BannerVidBox from './banner-vid-box';
import BannerVidBtn from './banner-vid-btn';

/**
 * Renders a banner component for archive pages.
 * It displays a heading, description, and an optional image and video button.
 * @param {Object} props - The component props.
 * @param {string} props.heading - The main heading text for the banner.
 * @param {string} props.description - The descriptive text for the banner.
 * @param {string} [props.image] - The URL of the image to display on the banner. Defaults to a placeholder if not provided.
 * @param {boolean} [props.withVideo] - If true, a video box and button will be displayed.
 * @returns {JSX.Element} The Banner component.
 */
export default function Banner({ heading, description, image, withVideo }) {
  const bannerImage = !image
    ? 'https://res.cloudinary.com/ddejhvzbf/image/upload/v1750071394/Static/vector-service-v1_p6jy69.webp'
    : image;

  return (
    <>
      <section className='breadcumb-section pt-0'>
        <div className='cta-service-v1 cta-banner archives-banner mx-auto bdrs16 position-relative overflow-hidden d-flex align-items-center mx20-lg px30-lg bg-white'>
          <Image
            height={226}
            width={198}
            className='left-top-img wow zoomIn'
            src='https://res.cloudinary.com/ddejhvzbf/image/upload/v1750071394/Static/left-top_dnznwz.webp'
            alt='vector'
          />
          <Image
            height={181}
            width={255}
            className='right-bottom-img wow zoomIn'
            src='https://res.cloudinary.com/ddejhvzbf/image/upload/v1750071395/Static/right-bottom_w0dkoq.webp'
            alt='vector'
          />
          <Image
            height={300}
            width={532}
            className='service-v1-vector d-none d-lg-block'
            src={bannerImage}
            alt='vector'
          />
          <div className='container'>
            <div className='row wow fadeInUp'>
              <div className='col-xl-5'>
                <div className='position-relative'>
                  <h1 className='heading-h2'>{heading}</h1>
                  <h2 className='heading-p mb-0 mb20'>{description}</h2>
                  {withVideo && <BannerVidBtn />}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {withVideo && <BannerVidBox />}
    </>
  );
}
