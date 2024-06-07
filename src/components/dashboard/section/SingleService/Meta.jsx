import UserImage from "@/components/user/UserImage";
import React from "react";

export default function Meta({
  title,
  image,
  firstName,
  lastName,
  displayName,
  rating,
  reviewsCount,
  views,
  verified,
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
          />
          {reviewsCount > 0 ? (
            <p className="mb-0 dark-color fz14 list-inline-item ml25 ml15-sm mb5-sm ml0-xs">
              <i className="fas fa-star vam fz10 review-color mb5"></i>{" "}
              <span>{rating}</span>
              <span className="ml5">
                {reviewsCount === 1
                  ? `(${reviewsCount}) αξιολόγηση`
                  : `(${reviewsCount}) αξιολογήσεις`}
              </span>
            </p>
          ) : null}

          {verified === null || verified === false ? null : (
            <p className="mb-0 dark-color fz14 list-inline-item ml25 ml15-sm mb5-sm ml0-xs">
              <i className="flaticon-badge vam fz20 me-2"></i>Πιστοποιημένος
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
