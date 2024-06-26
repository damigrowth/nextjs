// "use client";

import Image from "next/image";
import Link from "next/link";
// import { useState } from "react";

export default function ServiceCard({
  image,
  price,
  category,
  title,
  rating,
  reviews,
  slug,
}) {
  //   const [isFavActive, setFavActive] = useState(false);
  const maxTitleLength = 80;
  const truncatedTitle =
    title.length > maxTitleLength
      ? title.slice(0, maxTitleLength) + "..."
      : title;

  return (
    <>
      <div className="listing-style1">
        <div className="list-thumb">
          <Link href={`/service/${slug}`}>
            <Image
              height={190}
              width={255}
              className="w-100 h-100 object-fit-cover"
              src={image}
              alt={title}
            />
          </Link>
          {/* <a
            onClick={() => setFavActive(!isFavActive)}
            className={`listing-fav fz12 ${isFavActive ? "ui-fav-active" : ""}`}
          >
            <span className="far fa-heart" />
          </a> */}
        </div>
        <div className="list-content">
          <p className="list-text body-color fz14 mb-1">{category}</p>
          <h6 className="list-title">
            <Link href={`/service/${slug}`}>{truncatedTitle}</Link>
          </h6>
          <div
            className="review-meta d-flex align-items-center "
            style={{ height: "25px" }}
          >
            {rating && (
              <>
                <i className="fas fa-star fz10 review-color me-2" />
                <p className="mb-0 body-color fz14">
                  <span className="dark-color me-2">{rating}</span>
                  {/* {review} reviews */}
                </p>
              </>
            )}
          </div>

          <hr className="my-2" />
          <div className="list-meta mt15">
            <div className="budget">
              <p className="mb-0 body-color">
                από
                <span className="fz17 fw500 dark-color ms-1">{price}€</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
