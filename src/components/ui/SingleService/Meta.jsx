import UserImage from "@/components/user/UserImage";
import Image from "next/image";
import React from "react";

export default function Meta({
  title,
  image,
  firstName,
  lastName,
  username,
  displayName,
  rating,
  views,
  verified,
  totalReviews,
  topLevel,
}) {
  // console.log("meta", firstName, lastName, displayName, image);
  return (
    <div className="col-xl-12 mb30 pb30 bdrb1">
      <div className="position-relative">
        <h2>{title}</h2>
        <div className="list-meta meta mt30">
          <UserImage
            firstName={firstName}
            lastName={lastName}
            displayName={displayName}
            image={image}
            width={40}
            height={40}
            path={`/profile/${username}`}
          />
          <div className="tooltip-container">
            {verified === null || verified === false ? null : (
              <p className="mb-0 fz14 list-inline-item ml15 ml15-sm mb5-sm ml0-xs">
                <i className="flaticon-success fa-xl text-thm vam fz24 me-2"></i>
              </p>
            )}

            <div className="tooltip" style={{ top: "-50px" }}>
              Πιστοποιημένος
            </div>
          </div>

          <div className="tooltip-container">
            {topLevel && (
              <div className="top-badge-inline mb-0 list-inline-item ml5 ml15-sm mb5-sm ml0-xs">
                <Image
                  width={22}
                  height={22}
                  src="/images/top-badge.png"
                  alt="top badge"
                />
              </div>
            )}

            <div className="tooltip" style={{ top: "-95px" }}>
              Έχει λάβει εξαιρετικές αξιολογήσεις
            </div>
          </div>

          {totalReviews > 0 ? (
            <p className="mb-0 fz14 list-inline-item ml15 ml15-sm mb5-sm ml0-xs">
              <i className="fas fa-star vam fz10 review-color mb5"></i>{" "}
              <span className="dark-color ">{rating}</span>
              <span className="ml5 review-count-text">
                {totalReviews === 1
                  ? `(από ${totalReviews} αξιολόγηση)`
                  : `(από ${totalReviews} αξιολογήσεις)`}
              </span>
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
