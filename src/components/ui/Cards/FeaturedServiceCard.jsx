import UserImage from "@/components/user/UserImage";
import { formatRating } from "@/utils/formatRating";
import { getBestDimensions } from "@/utils/imageDimensions";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import SaveFrom from "../forms/SaveForm";
import { getSavedStatus } from "@/lib/save";

export default async function FeaturedServiceCard({
  service,
  fid,
  showDelete,
}) {
  const { id, media, category, title, slug, freelancer, price } = service;

  const freelancerData = freelancer?.data?.attributes;

  if (!freelancerData) return null;

  const {
    username,
    firstName,
    lastName,
    displayName,
    image: avatar,
    rating,
    reviews_total,
  } = freelancerData;

  let image = null;
  const fallbackImage = "/images/fallback/service.png";

  if (media.data.length > 0) {
    const formatResult = getBestDimensions(media.data[0].attributes.formats);
    image = formatResult && formatResult.url ? formatResult.url : fallbackImage;
  } else {
    image = fallbackImage;
  }

  return (
    <div className="listing-style1 bdrs16">
      <div className="list-thumb">
        <Link href={`/s/${slug}`}>
          <Image
            height={247}
            width={331}
            className="w-100"
            src={image}
            alt={`featured-service-${title}-freelancer-${freelancer?.data?.attributes?.username}`}
            style={{ objectFit: "cover" }}
          />
        </Link>
        {fid && (
          <SaveFrom
            type="service"
            id={id}
            showDelete={showDelete}
            isAuthenticated={fid ? true : false}
          />
        )}
      </div>
      {/* <div className={`list-content ${isContentExpanded ? "px-0" : ""}`}> */}
      <div className="list-content">
        <p className="list-text body-color fz14 mb-1">
          {category.data?.attributes?.label}
        </p>
        <h5 className="service-card-title">
          <Link href={`/s/${slug}`}>
            {title.length > 60 ? `${title.slice(0, 60)}...` : title}
          </Link>
        </h5>
        <div className="review-meta d-flex align-items-center">
          {reviews_total && (
            <>
              <i className="fas fa-star fz10 review-color me-2" />
              <p className="mb-0 body-color fz14">
                <span className="dark-color me-2">{formatRating(rating)}</span>
                {reviews_total > 1
                  ? `(${reviews_total} αξιολογήσεις)`
                  : `(${reviews_total} αξιολόγηση)`}
              </p>
            </>
          )}
        </div>
        <hr className="my-2" />
        <div className="list-meta d-flex justify-content-between align-items-center mt15">
          <UserImage
            image={avatar?.data?.attributes?.formats?.thumbnail?.url}
            width={30}
            height={30}
            firstName={firstName}
            lastName={lastName}
            displayName={displayName}
            path={`/profile/${username}`}
          />
          {price > 0 && (
            <div className="budget">
              <p className="mb-0 body-color">
                από
                <span className="fz17 fw500 dark-color ms-1">{price}€</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
