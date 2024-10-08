import UserImage from "@/components/user/UserImage";
import VerifiedBadge from "@/components/user/VerifiedBadge";
import { formatRating } from "@/utils/formatRating";
import Link from "next/link";
import React from "react";

export default function FreelancerCard({ freelancer, linkedName }) {
  const {
    username,
    tagline,
    rating,
    reviews_total,
    rate,
    topLevel,
    specialisations,
    category,
    subcategory,
    type,
  } = freelancer;

  const user = freelancer.user?.data?.attributes;

  return (
    <>
      <div className="data-loading-element freelancer-style1 text-center bdr1 hover-box-shadow">
        <div className="thumb w90 mb25 mx-auto position-relative rounded-circle">
          {/* <Image
            height={90}
            width={90}
            className="rounded-circle mx-auto"
            src={freelancer?.user?.data?.attributes?.formats?.thumbnail?.url}
            alt="thumb"
          /> */}
          <UserImage
            height={90}
            width={90}
            image={user.image.data?.attributes?.formats?.thumbnail?.url}
            alt="user-image"
            firstName={user.firstName}
            lastName={user.lastName}
            bigText
            path={`/profile/${username}`}
            topLevel={topLevel}
          />
        </div>
        <div className="review">
          {linkedName ? (
            <Link
              href={`/profile/${username}`}
              className="d-flex align-items-center justify-content-center mb-1"
            >
              <h5 className="title m0 mr5 text-bold">{user.displayName}</h5>
              <VerifiedBadge verified={user?.verified} />
            </Link>
          ) : (
            <div className="d-flex align-items-center justify-content-center mb-1">
              <h5 className="title m0 mr5 text-bold">{user.displayName}</h5>
              <VerifiedBadge verified={user?.verified} />
            </div>
          )}

          <p className="mb-0 text-bold">
            {subcategory?.data
              ? subcategory?.data?.attributes?.label
              : category?.data?.attributes?.label}
          </p>
          {reviews_total > 0 ? (
            <p className="mb-0 fz14 list-inline-item ">
              <i className="fas fa-star vam fz10 review-color mb5"></i>{" "}
              <span className="dark-color fw500">{formatRating(rating)}</span>
              <span className="ml5 review-count-text">
                {reviews_total === 1
                  ? `(${reviews_total} αξιολόγηση)`
                  : `(${reviews_total} αξιολογήσεις)`}
              </span>
            </p>
          ) : (
            <div className="empty-card-reviews"></div>
          )}
          {/* <div className="review">
            <p>
              <i className="fas fa-star fz10 review-color pr10" />
              <span className="dark-color fw500">{rating}</span>
              {`(${reviews_total} αξιολογήσεις)`}
            </p>
          </div> */}
          {specialisations?.data?.length > 0 ? (
            <div className="card-tags">
              {specialisations.data.map((el, i) => (
                <span key={i} className="card-tag">
                  {el.attributes.label}
                </span>
              ))}
            </div>
          ) : (
            <div className="empty-card-tags"></div>
          )}
          <div className="d-grid mt15">
            <Link
              href={`/profile/${username}`}
              className="ud-btn btn-light-thm"
            >
              Περισσότερα
              <i className="fal fa-arrow-right-long" />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
