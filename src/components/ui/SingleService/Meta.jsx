import Badges from "@/components/user/Badges";
import UserImage from "@/components/user/UserImage";
import { formatRating } from "@/utils/formatRating";
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
        <h1 className="heading-h2">{title}</h1>
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
          <Badges verified={verified} topLevel={topLevel} />

          {totalReviews > 0 ? (
            <p className="mb-0 fz14 list-inline-item ml15 ml15-sm mb5-sm ml0-xs">
              <i className="fas fa-star vam fz10 review-color mb5"></i>{" "}
              <span className="dark-color ">{formatRating(rating)}</span>
              <span className="ml5 review-count-text">
                {totalReviews === 1
                  ? `(${totalReviews} αξιολόγηση)`
                  : `(${totalReviews} αξιολογήσεις)`}
              </span>
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
