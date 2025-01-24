import UserImage from "@/components/user/UserImage";
import VerifiedBadge from "@/components/user/VerifiedBadge";
import { formatRating } from "@/utils/formatRating";
import Link from "next/link";
import React from "react";
import SaveForm from "../forms/SaveForm";
import { getSavedStatus } from "@/lib/save";

export default async function FreelancerCard({
  freelancer,
  fid,
  linkedName,
  showDelete,
}) {
  const {
    id,
    username,
    firstName,
    lastName,
    displayName,
    image,
    verified,
    rating,
    reviews_total,
    topLevel,
    specialisations,
    category,
    subcategory,
  } = freelancer;

  let savedStatus = null;
  let showSaveButton = false;

  // if user is logged in and is not the same user, show save button
  if (fid !== id) {
    showSaveButton = true;
    savedStatus = await getSavedStatus("freelancer", id);
  }
  return (
    <>
      <div className="data-loading-element freelancer-style1 text-center bdr1 hover-box-shadow posiiton-relative">
        {showSaveButton && (
          <SaveForm
            type="freelancer"
            id={id}
            initialSavedStatus={savedStatus}
            showDelete={showDelete}
          />
        )}
        <div className="thumb w90 mb25 mx-auto position-relative rounded-circle">
          <UserImage
            height={90}
            width={90}
            image={image.data?.attributes?.formats?.thumbnail?.url}
            alt="user-image"
            firstName={firstName}
            lastName={lastName}
            displayName={displayName}
            bigText
            path={`/profile/${username}`}
            topLevel={topLevel}
            hideDisplayName
          />
        </div>
        <div className="review">
          {linkedName ? (
            <Link
              href={`/profile/${username}`}
              className="d-flex align-items-center justify-content-center mb-1"
            >
              <h5 className="title m0 mr5 text-bold">{displayName}</h5>
              <VerifiedBadge verified={verified} />
            </Link>
          ) : (
            <div className="d-flex align-items-center justify-content-center mb-1">
              <h5 className="title m0 mr5 text-bold">{displayName}</h5>
              <VerifiedBadge verified={verified} />
            </div>
          )}
          <p className="mb-0 text-bold">
            {subcategory?.data
              ? subcategory?.data?.attributes?.label
              : category?.data?.attributes?.label || "\u00A0"}
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
            <div className="empty-card-reviews">&nbsp;</div>
          )}
          {specialisations?.data?.length > 0 ? (
            <div className="card-tags">
              {specialisations.data.map((el, i) => (
                <span key={i} className="card-tag">
                  {el.attributes.label}
                </span>
              ))}
            </div>
          ) : (
            <div className="empty-card-tags">&nbsp;</div>
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
