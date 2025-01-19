import { getUserId } from "@/lib/auth/user";
import { formatDate } from "@/utils/formatDate";
import Image from "next/image";
import React from "react";
import ReviewReactions from "./ReviewReactions";
import UserImage from "@/components/user/UserImage";
import Rating from "../rating/Rating";
import Link from "next/link";
import { formatRating } from "@/utils/formatRating";

export default async function Review({
  reviewId,
  service,
  firstName,
  lastName,
  displayName,
  image,
  date,
  comment,
  likes,
  dislikes,
  rating,
  showReviewsModel,
}) {
  const { formattedDate } = formatDate(date, "dd/MM/yy");

  const uid = await getUserId();

  const reactions = {
    likes: likes ? likes.map(({ id }) => Number(id)) : [],
    // dislikes: dislikes.map(({ id }) => Number(id)),
    uid,
    reviewId,
  };

  return (
    <div className="col-md-12 mb40">
      <div className="mt30 position-relative d-flex align-items-center justify-content-start mb30-sm">
        <UserImage
          firstName={firstName}
          lastName={lastName}
          image={image}
          width={50}
          height={50}
        />
        <div className="ml20">
          <h6 className="mt-0 mb-0">{displayName}</h6>
          {showReviewsModel && (
            <Link href={`/s/${service.slug}`} className="review-service-title">
              <span>{service.title}</span>
            </Link>
          )}
          <div className="d-flex align-items-center">
            <div className="d-flex align-items-center">
              <Rating
                count={5}
                value={rating}
                half={false}
                size={20}
                color1={"#6b7177"}
                color2={"#e1c03f"}
                onChange={null}
                edit={false}
              />
              <span className="ml5 fz14 fw600">{formatRating(rating)}</span>
            </div>
            <span className="inline-divider"></span>
            <span className="fz14">{formattedDate}</span>
          </div>
        </div>
      </div>
      <p className="text mt20 mb20">{comment}</p>
      {/* <ReviewReactions data={reactions} /> */}
    </div>
  );
}
