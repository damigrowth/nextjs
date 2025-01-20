import React from "react";
import Link from "next/link";
import Image from "next/image";
import { getBestDimensions } from "@/utils/imageDimensions";
import { MediaPlayer } from "../media/MediaPlayer";

export default function ServiceCardFile({ file, path, width, height }) {
  const fallbackImage = "/images/fallback/service.png";

  if (!file) {
    return (
      <Link href={path}>
        <div className="list-thumb flex-shrink-0 height">
          <Image
            height={height || 245}
            width={width || 329}
            className="w-100 h-100 object-fit-cover"
            src={fallbackImage}
            alt="service-thumbnail"
          />
        </div>
      </Link>
    );
  } else {
    return (
      <Link href={path}>
        <div className="list-thumb flex-shrink-0 height">
          {file.formats ? (
            <Image
              height={height || 245}
              width={width || 329}
              className="w-100 h-100 object-fit-cover"
              src={getBestDimensions(file.formats).url}
              alt="service-thumbnail"
            />
          ) : (
            <div className="d-flex align-items-center justify-content-center h-100 bg-dark">
              <MediaPlayer url={file.url} />
            </div>
          )}
        </div>
      </Link>
    );
  }
}
