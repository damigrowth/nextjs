import UserImage from "@/components/user/UserImage";
import Link from "next/link";
import React from "react";
import ServiceCardMedia from "./ServiceCardMedia";
import Badges from "@/components/user/Badges";
import CardReviews from "../Reviews/CardReviews";

export default function ServiceCard({ service }) {
  const {
    title,
    price,
    rating,
    reviews_total,
    slug,
    category,
    media,
    freelancer,
  } = service.attributes;

  if (!freelancer.data) {
    return null;
  }

  if (!slug) {
    return null;
  }

  const user = freelancer?.data?.attributes?.user?.data?.attributes;

  const isVerified =
    user?.verification?.data?.attributes?.status?.data?.attributes?.type ===
    "Completed";

  return (
    <div className="data-loading-element listing-style1 list-style d-block d-xl-flex align-items-center">
      {slug ? (
        <Link href={`/s/${slug}`}>
          <ServiceCardMedia media={media?.data} />
        </Link>
      ) : (
        <ServiceCardMedia media={media?.data} />
      )}

      <div className="list-content flex-grow-1 ms-1">
        <a className="listing-fav fz12">
          <span className="far fa-heart" />
        </a>
        <div className="archive-service-card-meta">
          <div>
            <h5 className="list-title">
              <Link href={`/s/${slug}`}>{title}</Link>
            </h5>
            <p className="list-text body-color fz14 mb-1">
              {category?.data?.attributes?.label}
            </p>
          </div>
          <CardReviews rating={rating} reviews_total={reviews_total} />
        </div>

        <hr className="my-2" />
        <div className="list-meta d-flex justify-content-between align-items-center mt15">
          <div className="archive-service-card-user-meta">
            <UserImage
              firstName={user.firstName}
              lastName={user.lastName}
              displayName={user.displayName}
              image={user?.image?.data?.attributes?.formats?.thumbnail?.url}
              alt={
                user?.image?.formats?.thumbnail?.provider_metadata?.public_id
              }
              width={30}
              height={30}
              path={`/profile/${freelancer?.data?.attributes?.username}`}
            />

            <Badges
              verified={isVerified}
              topLevel={freelancer?.data?.attributes?.topLevel}
            />
          </div>

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
