import React from "react";
import Link from "next/link";
import Image from "next/image";
import { getBestDimensions } from "@/utils/imageDimensions";
import { MediaPlayer } from "../media/MediaPlayer";
import VideoPreview from "./VideoPreview"; // Import VideoPreview

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
    // Conditionally render Link only for images
    if (file.formats) {
      return (
        <Link href={path}>
          <div className="list-thumb flex-shrink-0 height">
            <Image
              height={height || 245}
              width={width || 329}
              className="w-100 h-100 object-fit-cover"
              src={(() => {
                const formatResult = getBestDimensions(file.formats);
                return formatResult && formatResult.url
                  ? formatResult.url
                  : fallbackImage;
              })()}
              alt="service-thumbnail"
            />
          </div>
        </Link>
      );
    } else {
      // Render without Link for non-images (audio, video, fallback)
      return (
        <div className="list-thumb flex-shrink-0 height">
          {file.mime?.startsWith("audio/") ? ( // Explicitly check for audio MIME type
            // Render fallback image if it's audio
            <Image
              height={height || 245}
              width={width || 329}
              className="w-100 h-100 object-fit-cover"
              src={fallbackImage}
              alt="service-thumbnail"
            />
          ) : file.mime?.startsWith("video/") ? ( // Check if it's video
            // Render VideoPreview for video files
            <div
              style={{
                width: width ? `${width}px` : "100%",
                height: height ? `${height}px` : "100%",
              }}
            >
              {" "}
              {/* Container with dimensions */}
              <VideoPreview
                previewUrl={file.previewUrl} // Pass previewUrl
                videoUrl={file.url} // Pass videoUrl
                mime={file.mime} // Pass mime
              />
            </div>
          ) : (
            // Fallback for any other non-image, non-audio, non-video type (or if video check fails)
            // Render fallback image as a safe default
            <Image
              height={height || 245}
              width={width || 329}
              className="w-100 h-100 object-fit-cover"
              src={fallbackImage}
              alt="service-thumbnail"
            />
          )}
        </div>
      );
    }
  }
}
