import { getBestDimensions } from "@/utils/imageDimensions";
import Image from "next/image";
import React from "react";

export default function FeaturedFile({ formats }) {
  const image = getBestDimensions(formats);

  return (
    <>
      <div className="scrollbalance-inner">
        <div className="service-single-image vam_nav_style slider-1-grid owl-carousel owl-theme mb60 owl-loaded owl-drag">
          <div className="thumb p50 p30-sm">
            <Image
              height={image.height}
              width={image.width}
              src={image.url}
              alt={`featured-image`}
              className="w-100 h-auto"
            />
          </div>
        </div>
      </div>
    </>
  );
}
