import Image from "next/image"; // Import Next.js Image

export const MediaThumb = ({
  url,
  mime,
  previewUrl,
  width,
  height,
  fontSize,
}) => {
  const isVideo = mime?.startsWith("video/");
  const showPreview = isVideo && previewUrl;

  return (
    <div
      style={{
        position: "relative",
        width: width ? `${width}px` : "300px",
        height: height ? `${height}px` : "300px",
        backgroundColor: "#404040",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        cursor: "pointer",
        overflow: "hidden", // Hide potential overflow from Image
      }}
    >
      {showPreview ? (
        // Render preview image if it's a video and previewUrl exists
        <Image
          src={previewUrl}
          alt="Video thumbnail preview"
          fill // Use fill to cover the container
          sizes="(max-width: 768px) 25vw, (max-width: 1200px) 15vw, 10vw" // Example sizes for thumbnails
          style={{ objectFit: "contain" }}
          unoptimized={true} // Good practice for GIFs
        />
      ) : (
        // Otherwise, render the icon
        <i
          className={isVideo ? "fas fa-video" : "fas fa-music"} // Determine icon based on mime
          style={{
            fontSize: fontSize ? `${fontSize}px` : "24px", // Smaller default icon size for thumbs
            color: "white",
            opacity: 0.8,
          }}
        />
      )}
    </div>
  );
};
