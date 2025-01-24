import UserImage from "@/components/user/UserImage";
import Link from "next/link";
import React from "react";
import ServiceCardFiles from "./ServiceCardFiles";
import Badges from "@/components/user/Badges";
import CardReviews from "../Reviews/CardReviews";
import ServiceCardFile from "./ServiceCardFile";
import { getBestDimensions } from "@/utils/imageDimensions";
import SaveForm from "../forms/SaveForm";
import { getFreelancerId } from "@/lib/users/freelancer";
import { getSavedStatus } from "@/lib/save";

export default async function ServiceCard({ service, fid }) {
  const { title, price, slug, category, subcategory, media, freelancer } =
    service.attributes;

  if (!freelancer.data) {
    return null;
  }

  if (!slug) {
    return null;
  }

  const freelancerData = freelancer.data.attributes;
  const {
    firstName,
    lastName,
    displayName,
    image: avatar,
    username,
    verified,
    topLevel,
    rating,
    reviews_total,
  } = freelancerData;

  let saveStatus = null;

  if (fid) {
    saveStatus = await getSavedStatus("service", service.id);
  }

  return (
    <div className="data-loading-element listing-style1 list-style d-block d-xl-flex align-items-center">
      <div className="arc-service-card-image-wrapper">
        {media.data.length > 1 ? (
          <ServiceCardFiles
            media={media?.data?.map((item) => item.attributes)}
            path={`/s/${slug}`}
          />
        ) : (
          <ServiceCardFile
            file={media?.data[0]?.attributes}
            path={`/s/${slug}`}
          />
        )}
      </div>
      <div className="list-content flex-grow-1 ms-1 bgc-white">
        <SaveForm
          type="service"
          initialSavedStatus={saveStatus}
          id={service.id}
        />
        <div className="archive-service-card-meta">
          <div>
            <h5 className="list-title">
              <Link href={`/s/${slug}`}>{title}</Link>
            </h5>
            <p className="list-text body-color fz14 mb-1">
              {category?.data?.attributes?.label}{" "}
              {subcategory?.data &&
                " - " + subcategory?.data?.attributes?.label}
            </p>
          </div>
          <CardReviews rating={rating} reviews_total={reviews_total} />
        </div>

        <hr className="my-2" />
        <div className="list-meta d-flex justify-content-between align-items-center mt15">
          <div className="archive-service-card-user-meta">
            <UserImage
              firstName={firstName}
              lastName={lastName}
              displayName={displayName}
              image={avatar?.data?.attributes?.formats?.thumbnail?.url}
              alt={avatar?.formats?.thumbnail?.provider_metadata?.public_id}
              width={30}
              height={30}
              path={`/profile/${username}`}
            />

            <Badges verified={verified} topLevel={topLevel} />
          </div>
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
