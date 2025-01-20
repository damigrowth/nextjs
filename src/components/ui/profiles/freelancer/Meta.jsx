import Socials from "@/components/ui/socials/Socials";
import Rating from "@/components/user/Rating";
import UserImage from "@/components/user/UserImage";
import VerifiedBadge from "@/components/user/VerifiedBadge";
import Image from "next/image";
import React from "react";

export default function Meta({
  topLevel,
  firstName,
  lastName,
  displayName,
  tagline,
  socials,
  image,
  rating,
  totalReviews,
  verified,
  coverage,
  visibility,
}) {
  return (
    <div className="cta-service-v1 freelancer-single-v1 pt30 pb30 bdrs16 position-relative overflow-hidden mb30 d-flex align-items-center">
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
                  displayName={displayName}
                  firstName={firstName}
                  lastName={lastName}
                  image={image}
                  width={90}
                  height={91}
                  topLevel={topLevel}
                  bigText
                  hideDisplayName
                />
              </div>
              <div className="ml20 ml0-xs">
                <div className="d-flex align-items-center">
                  <h1 className="heading-h5 title m0 p0 pr5">{displayName}</h1>
                  <VerifiedBadge verified={verified} />
                </div>
                <h2 className="heading-p mb-0">{tagline}</h2>
                {totalReviews > 0 && (
                  <Rating totalReviews={totalReviews} rating={rating} />
                )}
                {coverage.onbase &&
                  coverage?.address &&
                  visibility?.address && (
                    <p className="mb-0 dark-color fz15 fw500 list-inline-item mb5-sm ml0-xs">
                      <i className="flaticon-home-1 gray-icon vam fz18"></i>{" "}
                      {coverage.address}
                    </p>
                  )}
                {coverage.onsite &&
                  coverage?.areas?.data &&
                  coverage.areas.data.length > 0 && (
                    <p className="mb-0 dark-color fz15 fw500 list-inline-item ml15 mb5-sm ml0-xs">
                      <i className="flaticon-tracking gray-icon vam fz18"></i>{" "}
                      {coverage.areas.data.map(
                        (el, i, arr) =>
                          `${el.attributes.name}${
                            i < arr.length - 1 ? ", " : ""
                          }`
                      )}
                    </p>
                  )}
                <Socials socials={socials} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
