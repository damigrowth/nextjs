import React from "react";
import BannerVidBox from "./BannerVidBox";
import BannerVidBtn from "./BannerVidBtn";

export default function BannerVid({ heading, description }) {
  return (
    <>
      <section className="breadcumb-section pt-0">
        <div className="cta-service-v4 cta-banner mx-auto maxw1700 pt120 pb120 bdrs16 position-relative overflow-hidden d-flex align-items-center mx20-lg px30-lg bg-white">
          <div className="container">
            <div className="row wow fadeInUp">
              <div className="col-xl-5">
                <div className="position-relative">
                  <h2 className="text-white">{heading}</h2>
                  <p className="text mb30 text-white">{description}</p>
                  <BannerVidBtn />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <BannerVidBox />
    </>
  );
}
