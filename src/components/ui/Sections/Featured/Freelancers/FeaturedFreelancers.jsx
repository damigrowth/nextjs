import React from "react";
import Link from "next/link";
import FreelancersList from "./FreelancersList";

export default function FeaturedFreelancers({ freelancers }) {
  return (
    <>
      <section className="bgc-dark pb90 pb30-md">
        <div className="container">
          <div className="row align-items-center wow fadeInUp">
            <div className="col-lg-9">
              <div className="main-title">
                <h2 className="title text-white">Top Επαγγελματίες</h2>
                <p className="paragraph text-white">
                  Δείτε τους καλύτερους επαγγελματίες που βρίσκονται στην
                  πλατφόρμα μας.
                </p>
              </div>
            </div>
            <div className="col-lg-3">
              <div className="text-start text-lg-end mb-4 mb-lg-2">
                <Link className="ud-btn2 text-white" href="/pros">
                  Όλοι οι Επαγγελματίες
                  <i className="fal fa-arrow-right-long" />
                </Link>
              </div>
            </div>
          </div>
          <div className="row wow fadeInUp">
            <div className="col-lg-12">
              <FreelancersList freelancers={freelancers} />
              <div className="row justify-content-center">
                <div className="col-auto">
                  <button className="swiper__btn swiper__btn-2 btn__prev__013">
                    <i className="far fa-arrow-left-long" />
                  </button>
                </div>
                <div className="col-auto">
                  <div className="swiper__pagination swiper__pagination-2 swiper__pagination__013"></div>
                </div>
                <div className="col-auto">
                  <button className="swiper__btn swiper__btn-2 btn__next__013">
                    <i className="far fa-arrow-right-long" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
