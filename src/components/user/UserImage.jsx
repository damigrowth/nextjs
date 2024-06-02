import Image from "next/image";
import React from "react";
import InitialsImage from "./InitialsImage";
import Link from "next/link";

export default function UserImage({
  image,
  width,
  height,
  alt,
  firstName,
  lastName,
  displayName,
}) {
  return (
    <Link className="user-image-container mb5-sm" href="/">
      <span className="position-relative">
        {image ? (
          <Image
            width={!width ? 40 : width}
            height={!height ? 40 : height}
            className="rounded-circle"
            src={image}
            alt={alt || "profile-image"}
          />
        ) : (
          <InitialsImage
            firstName={firstName}
            lastName={lastName}
            width={width}
            height={height}
          />
        )}

        {/* <span className="online-badge"></span>  Make this functionality! */}
      </span>
      {displayName && <span className="fz14 ml10">{displayName}</span>}
    </Link>
  );
}
