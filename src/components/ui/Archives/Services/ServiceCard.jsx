import UserImage from "@/components/user/UserImage";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import ServiceCardMedia from "./ServiceCardMedia";

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

  const user = freelancer?.data?.attributes?.user?.data?.attributes;

  return (
    <div className="listing-style1 list-style d-block d-xl-flex align-items-center">
      <ServiceCardMedia media={media?.data} />
      <div className="list-content flex-grow-1 ms-1">
        <a className="listing-fav fz12">
          <span className="far fa-heart" />
        </a>
        <p className="list-text body-color fz14 mb-1">
          {category?.data?.attributes?.label}
        </p>
        <h5 className="list-title">
          <Link href={`/s/${slug}`}>{title}</Link>
        </h5>

        <div className="review-meta d-flex align-items-center">
          {reviews_total && reviews_total > 0 && (
            <>
              <i className="fas fa-star fz10 review-color me-2" />
              <p className="mb-0 body-color fz14">
                <span className="dark-color me-2">{rating}</span>
                {reviews_total > 1
                  ? reviews_total + " " + "αξιολογήσεις"
                  : reviews_total + " " + "αξιολόγηση"}
              </p>
            </>
          )}
        </div>

        <hr className="my-2" />
        <div className="list-meta d-flex justify-content-between align-items-center mt15">
          <UserImage
            firstName={user.firstName}
            lastName={user.lastName}
            displayName={user.displayName}
            image={user?.image?.data?.attributes?.formats?.thumbnail?.url}
            alt={user?.image?.formats?.thumbnail?.provider_metadata?.public_id}
            width={30}
            height={30}
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