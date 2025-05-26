import Image from "next/image";
import React from "react";
import BannerVidBtn from "./banner-vid-btn";
import BannerVidBox from "./banner-vid-box";

export default function Banner({ heading, description, image, withVideo }) {
  const bannerImage = !image
    ? "/images/vector-img/vector-service-v1.png"
    : image;

  return (
    <>
      <section className="breadcumb-section pt-0">
        <div className="cta-service-v1 cta-banner archives-banner mx-auto bdrs16 position-relative overflow-hidden d-flex align-items-center mx20-lg px30-lg bg-white">
          <Image
            height={226}
            width={198}
            className="left-top-img wow zoomIn"
            src="/images/vector-img/left-top.png"
            alt="vector"
          />
          <Image
            height={181}
            width={255}
            className="right-bottom-img wow zoomIn"
            src="/images/vector-img/right-bottom.png"
            alt="vector"
          />
          <Image
            height={300}
            width={532}
            className="service-v1-vector d-none d-lg-block"
            src={bannerImage}
            alt="vector"
          />
          <div className="container">
            <div className="row wow fadeInUp">
              <div className="col-xl-5">
                <div className="position-relative">
                  <h1 className="heading-h2">{heading}</h1>
                  <h2 className="heading-p mb-0 mb20">{description}</h2>
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
