import { getBestDimensions } from "@/utils/imageDimensions";
import Image from "next/image";
import React from "react";
import { MediaPlayer } from "../media/MediaPlayer";

export default function FeaturedFile({ file, formats }) {
  let image = null;

  if (file.attributes.formats) {
    image = getBestDimensions(formats);
  } else {
    image = null;
  }

  return (
    <>
      <div className="scrollbalance-inner">
        <div className="service-single-image vam_nav_style slider-1-grid owl-carousel owl-theme mb60 owl-loaded owl-drag">
          <div className="thumb p50 p30-sm">
            {image ? (
              <Image
                height={image.height}
                width={image.width}
                src={image.url}
                alt={`featured-image`}
                className="w-100 h-auto"
              />
            ) : (
              <div className="d-flex align-items-center justify-content-center">
                <MediaPlayer url={file.attributes.url} />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
