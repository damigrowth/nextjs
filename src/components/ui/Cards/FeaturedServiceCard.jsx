import UserImage from "@/components/user/UserImage";
import { formatRating } from "@/utils/formatRating";
import { getBestDimensions } from "@/utils/imageDimensions";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function FeaturedServiceCard({ service }) {
  const {
    media,
    category,
    title,
    slug,
    rating,
    reviews_total,
    freelancer,
    price,
  } = service;

  const freelancerRating = freelancer.data.attributes.rating;
  const freelancerReviewsTotal = freelancer.data.attributes.reviews_total;

  let image = null;
  const fallbackImage = "/images/fallback/service.png";

  if (media.data.length > 0) {
    image = getBestDimensions(media.data[0].attributes.formats).url;
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
          />
        </Link>
        {/* <a
            onClick={() => setFavActive(!isFavActive)}
            className={`listing-fav fz12 ${isFavActive ? "ui-fav-active" : ""}`}
          className="listing-fav fz12 "
        >
          <span className="far fa-heart" />
        </a> */}
      </div>
      {/* <div className={`list-content ${isContentExpanded ? "px-0" : ""}`}> */}
      <div className="list-content">
        <p className="list-text body-color fz14 mb-1">
          {category.data?.attributes?.label}
        </p>
        <h5 className="list-title">
          <Link href={`/s/${slug}`}>{title.slice(0, 40) + "..."}</Link>
        </h5>
        <div className="review-meta d-flex align-items-center">
          {freelancerReviewsTotal && (
            <>
              <i className="fas fa-star fz10 review-color me-2" />
              <p className="mb-0 body-color fz14">
                <span className="dark-color me-2">
                  {formatRating(freelancerRating)}
                </span>
                {freelancerReviewsTotal > 1
                  ? `(${freelancerReviewsTotal} αξιολογήσεις)`
                  : `(${freelancerReviewsTotal} αξιολόγηση)`}
              </p>
            </>
          )}
        </div>
        <hr className="my-2" />
        <div className="list-meta d-flex justify-content-between align-items-center mt15">
          <UserImage
            image={
              freelancer.data.attributes.user.data.attributes.image.data
                .attributes.formats.thumbnail.url
            }
            width={30}
            height={30}
            firstName={
              freelancer.data.attributes.user.data.attributes.firstName
            }
            lastName={freelancer.data.attributes.user.data.attributes.lastName}
            displayName={
              freelancer.data.attributes.user.data.attributes.displayName
            }
            path={`/profile/${freelancer.data.attributes.username}`}
          />

          <div className="budget">
            <p className="mb-0 body-color">
              από
              <span className="fz17 fw500 dark-color ms-1">{price}€</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
