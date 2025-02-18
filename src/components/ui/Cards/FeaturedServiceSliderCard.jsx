import Link from "next/link";
import UserImage from "@/components/user/UserImage";
import { formatRating } from "@/utils/formatRating";
import SaveFrom from "../forms/SaveForm";
import FeaturedServiceSlideCardMedia from "./ServiceSlideCardMedia";
import { getSavedStatus } from "@/lib/save";

export default async function FeaturedServiceSliderCard({
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

  let savedStatus = null;

  // if user is logged in and is not the same user, show save button
  if (fid) {
    savedStatus = await getSavedStatus("service", id);
  }

  return (
    <>
      <div className="listing-style1 default-box-shadow1 bdrs16">
        <div className="list-thumb">
          <SaveFrom
            type="service"
            id={id}
            initialSavedStatus={savedStatus}
            showDelete={showDelete}
          />
          <div className="listing-thumbIn-slider position-relative navi_pagi_bottom_center slider-1-grid">
            <div className="item">
              <Link href={`/s/${slug}`}>
                <FeaturedServiceSlideCardMedia media={media} />
              </Link>
            </div>
          </div>
        </div>
        <div className="list-content">
          <p className="list-text body-color fz14 mb-1">
            {category?.data?.attributes?.label}
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
                  <span className="dark-color me-2">
                    {formatRating(rating)}
                  </span>
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
    </>
  );
}
