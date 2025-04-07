import { getBestDimensions } from "@/utils/imageDimensions";
import Image from "next/image";
import React from "react";
// MediaPlayer might not be needed if VideoPreview handles the video case
// import { MediaPlayer } from "../media/MediaPlayer";
import VideoPreview from "../Cards/VideoPreview"; // Import VideoPreview

export default function FeaturedFile({ file, formats }) {
  // Early exit if no file is provided
  if (!file || !file.attributes) {
    // Optionally render a fallback or null
    return null;
  }

  let image = null;
  const fileAttributes = file.attributes;

  if (fileAttributes.formats) {
    image = getBestDimensions(formats || fileAttributes.formats); // Use formats prop if available, else from file
  } else {
    image = null;
  }

  return (
    <>
      <div className="scrollbalance-inner">
        {image ? (
          // If it's an image, keep the original structure (might be styled for single image sliders)
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
        ) : fileAttributes.mime?.startsWith("video/") ? (
          // If it's a video, use a container with enforced aspect ratio
          <div className="thumb p50 p30-sm">
            <div className="service-single-image vam_nav_style slider-1-grid owl-carousel owl-theme owl-loaded owl-drag ratio ratio-16x9 ">
              {" "}
              {/* Keep margin, add aspect ratio */}
              {/* Render VideoPreview directly inside, it should fill the ratio container */}
              {/* Remove thumb div as ratio div handles structure */}
              <VideoPreview
                previewUrl={fileAttributes.previewUrl}
                videoUrl={fileAttributes.url}
                mime={fileAttributes.mime}
              />
              {/* Removed closing thumb div */}
            </div>
          </div>
        ) : null}
        {/* Render nothing if it's not image, not audio, and not video */}
      </div>
    </>
  );
}
