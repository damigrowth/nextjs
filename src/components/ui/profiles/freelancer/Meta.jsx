import Socials from "@/components/ui/socials/Socials";
import UserImage from "@/components/user/UserImage";
import { formatRating } from "@/utils/formatRating";
import Image from "next/image";
import React from "react";

export default function Meta({
  topLevel,
  firstName,
  lastName,
  displayName,
  tagline,
  base,
  socials,
  image,
  rating,
  totalReviews,
}) {
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
              <div className="position-relative freelancer-single-style">
                {/* <span className="online"></span> */}
                <UserImage
                  firstName={firstName}
                  lastName={lastName}
                  image={image}
                  width={90}
                  height={91}
                  topLevel={topLevel}
                />
              </div>
              <div className="ml20 ml0-xs">
                <h5 className="title mb-1">{displayName}</h5>
                <p className="mb-0">{tagline}</p>
                {totalReviews > 0 ? (
                  <p className="mb-0  fz14 list-inline-item ml15-sm mb5-sm ml0-xs">
                    <i className="fas fa-star vam fz10 review-color mb5"></i>{" "}
                    <span className="dark-color">{formatRating(rating)}</span>
                    <span className="ml5 body-color">
                      {totalReviews === 1
                        ? `(${totalReviews} αξιολόγηση)`
                        : `(${totalReviews} αξιολογήσεις)`}
                    </span>
                  </p>
                ) : null}
                {base && (
                  <p className="mb-0 dark-color fz15 fw500 list-inline-item ml15 mb5-sm ml0-xs">
                    <i className="flaticon-place vam fz20 me-2"></i> {base}
                  </p>
                )}

                <div className="mb-0 dark-color fz15 fw500 list-inline-item ml15 mb5-sm ml0-xs">
                  <Socials socials={socials} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
