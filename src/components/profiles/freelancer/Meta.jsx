import Image from "next/image";
import React from "react";

export default function Meta({ data }) {
  return (
    <div className="cta-service-v1 freelancer-single-v1 pt60 pb60 bdrs16 position-relative overflow-hidden mb30 d-flex align-items-center">
      <Image
        width={198}
        height={226}
        style={{ height: "fit-content" }}
        className="left-top-img wow zoomIn"
        src="/images/vector-img/left-top.png"
        alt=""
      />
      <Image
        width={255}
        height={181}
        style={{ height: "fit-content" }}
        className="right-bottom-img wow zoomIn"
        src="/images/vector-img/right-bottom.png"
        alt=""
      />
      <div className="row wow fadeInUp">
        <div className="col-xl-12">
          <div className="position-relative pl50 pl20-sm">
            <div className="list-meta d-sm-flex align-items-center">
              <a className="position-relative freelancer-single-style" href="#">
                <span className="online"></span>
                <Image
                  width={90}
                  height={90}
                  className="rounded-circle w-100 wa-sm mb15-sm"
                  src={data?.img ? data.img : "/images/team/fl-1.png"}
                  alt="Freelancer Photo"
                />
              </a>
              <div className="ml20 ml0-xs">
                <h5 className="title mb-1">
                  {data?.name ? data.name : "Leslie Alexander"}
                </h5>
                <p className="mb-0">UI/UX Designer</p>
                <p className="mb-0 dark-color fz15 fw500 list-inline-item mb5-sm">
                  <i className="fas fa-star vam fz10 review-color me-2"></i>{" "}
                  4.82 94 reviews
                </p>
                <p className="mb-0 dark-color fz15 fw500 list-inline-item ml15 mb5-sm ml0-xs">
                  <i className="flaticon-place vam fz20 me-2"></i> London, UK
                </p>
                <p className="mb-0 dark-color fz15 fw500 list-inline-item ml15 mb5-sm ml0-xs">
                  <i className="flaticon-30-days vam fz20 me-2"></i> Member
                  since April 1, 2022
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
