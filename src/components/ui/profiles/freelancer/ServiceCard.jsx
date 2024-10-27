// "use client";

import Image from "next/image";
import Link from "next/link";
import CardReviews from "../../Reviews/CardReviews";
import ServiceCardFiles from "../../Cards/ServiceCardFiles";
import ServiceCardFile from "../../Cards/ServiceCardFile";
// import { useState } from "react";

export default function ServiceCard({
  media,
  price,
  category,
  title,
  rating,
  reviews_total,
  slug,
}) {
  //   const [isFavActive, setFavActive] = useState(false);
  const maxTitleLength = 50;
  const truncatedTitle =
    title.length > maxTitleLength
      ? title.slice(0, maxTitleLength) + "..."
      : title;

  const fallbackImage = "/images/fallback/service.png";

  return (
    <>
      <div className="listing-style1">
        <div className="list-thumb">
          {media.length === 0 && (
            <Link href={`/s/${slug}`}>
              <Image
                height={190}
                width={255}
                className="w-100 h-100 object-fit-cover"
                src={fallbackImage}
                alt={title}
              />
            </Link>
          )}
          {media.length > 1 ? (
            <ServiceCardFiles
              media={media.map((item) => item.attributes)}
              path={`/s/${slug}`}
            />
          ) : (
            <ServiceCardFile file={media[0]?.attributes} path={`/s/${slug}`} />
          )}
          {/* <Link href={`/s/${slug}`}>
            {media.length === 0 && (
              <Image
                height={190}
                width={255}
                className="w-100 h-100 object-fit-cover"
                src={"/images/service-fallback.png"}
                alt={title}
              />
            )}

            {media.length > 1 && <div>multiple images</div>}
          </Link> */}
          {/* <a
            onClick={() => setFavActive(!isFavActive)}
            className={`listing-fav fz12 ${isFavActive ? "ui-fav-active" : ""}`}
          >
            <span className="far fa-heart" />
          </a> */}
        </div>
        <div className="list-content">
          <p className="list-text body-color fz14 mb-1">{category}</p>
          <h6 className="list-title service-card-title">
            <Link href={`/s/${slug}`}>{truncatedTitle}</Link>
          </h6>
          <CardReviews rating={rating} reviews_total={reviews_total} />
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
