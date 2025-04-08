"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image"; // Import Next.js Image component

// Simple SVG Play Icon
const PlayIcon = ({ className }) => (
  <svg
    style={{
      color: "white",
      width: "85px", // Reduced size again
      height: "85px", // Reduced size again
      // Kept drop shadow
      filter: "drop-shadow(0 1px 1px rgb(0 0 0 / 0.1))", // Simplified shadow
    }}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M8 5v14l11-7z" />
  </svg>
);

export default function VideoPreview({ previewUrl, videoUrl, mime }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const gifRef = useRef(null);
  const staticGifRef = useRef(null); // Ref for the static image

  // Effect to control GIF playback on hover
  useEffect(() => {
    const gifElement = gifRef.current;
    const staticGifElement = staticGifRef.current;
    if (!gifElement || !staticGifElement) return;

    if (isHovered) {
      // Swap src to start animation (assuming browser restarts GIF on src change)
      // Or, if the GIF naturally loops, just ensure it's visible
      gifElement.style.display = "block";
      staticGifElement.style.display = "none";
    } else {
      // Show static image when not hovered
      gifElement.style.display = "none";
      staticGifElement.style.display = "block";
    }
  }, [isHovered, previewUrl]);

  const handlePlayClick = (e) => {
    e.stopPropagation(); // Prevent triggering other click events (like link navigation)
    setIsPlaying(true);
  };

  if (!previewUrl) {
    // Fallback if previewUrl is missing - directly show video player
    return (
      <div className="w-100 h-100 d-flex align-items-center justify-content-center bg-black">
        <video controls className="mw-100 mh-100">
          {" "}
          {/* Bootstrap max width/height */}
          <source src={videoUrl} type={mime} />
          Your browser does not support the video tag.
        </video>
      </div>
    );
  }

  return (
    <div
      className="w-100 h-100 overflow-hidden bg-black" // Bootstrap classes
      style={{ cursor: "pointer" }} // Inline style for cursor - Keep cursor pointer on whole area for visual cue
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      // Removed onClick={handlePlayClick} from the main div
    >
      {!isPlaying ? (
        <>
          {/* Wrapper for Static Image */}
          <div
            ref={staticGifRef}
            className="position-absolute top-0 start-0 w-100 h-100"
            style={{ display: "block" }} // Initially visible
          >
            <Image
              src={previewUrl}
              alt="Video preview static"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              style={{ objectFit: "cover" }} // Image fills the wrapper
              priority={false}
              unoptimized={true}
            />
          </div>
          {/* Wrapper for Animated GIF */}
          <div
            ref={gifRef}
            className="position-absolute top-0 start-0 w-100 h-100"
            style={{ display: "none" }} // Initially hidden
          >
            <Image
              src={previewUrl} // Same URL, browser should handle animation if it's a GIF
              alt="Video preview"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              style={{ objectFit: "cover" }}
              priority={false}
              unoptimized={true}
            />
          </div>
          <div
            className="position-absolute top-0 start-0 end-0 bottom-0 d-flex align-items-center justify-content-center bg-dark bg-opacity-50 opacity-100" // Bootstrap classes
            onClick={handlePlayClick} // Moved onClick here to only trigger on overlay click
            // Note: Hover opacity effect might require custom CSS with Bootstrap
          >
            {/* Using smaller inline styles for size */}
            <PlayIcon />
          </div>
        </>
      ) : (
        <div className="w-100 h-100 d-flex align-items-center justify-content-center">
          {" "}
          {/* Bootstrap classes */}
          <video controls autoPlay className="mw-100 mh-100">
            {" "}
            {/* Bootstrap max width/height */}
            <source src={videoUrl} type={mime} />
            Your browser does not support the video tag.
          </video>
        </div>
      )}
    </div>
  );
}
