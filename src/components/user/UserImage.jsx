import Image from "next/image";
import React from "react";
import InitialsImage from "./InitialsImage";
import Link from "next/link";
import TooltipTop from "../ui/TooltipTop";

export default function UserImage({
  image,
  width,
  height,
  alt,
  firstName,
  lastName,
  displayName,
  bigText,
  path,
  topLevel,
}) {
  const content = (
    <>
      <div className="position-relative">
        {topLevel && (
          <div id="top-level" className="top-badge">
            {/* <div className="icon ">
                      <span className="flaticon-badge" />
                    </div> */}
            <Image
              width={30}
              height={30}
              src="/images/top-badge.png"
              alt="top badge"
            />
            <TooltipTop anchor="top-level">
              Έχει λάβει εξαιρετικές αξιολογήσεις
            </TooltipTop>
          </div>
        )}
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
            bigText={bigText}
          />
        )}
      </div>
      {displayName && (
        <span className="fz14 lh-base ml10 mr10 ml5-xs">{displayName}</span>
      )}
    </>
  );

  return (
    <div className="user-image-container mb5-sm">
      {path ? (
        <Link
          href={path}
          className="d-flex justify-content-center align-items-center"
        >
          {content}
        </Link>
      ) : (
        content
      )}
    </div>
  );
}
