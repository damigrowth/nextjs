import { getMediaType } from "@/utils/media";

export const MediaThumb = ({ url, width, height, fontSize }) => {
  const mediaType = getMediaType(url);
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
      }}
    >
      <i
        className={mediaType === "video" ? "fas fa-video" : "fas fa-music"}
        style={{
          fontSize: fontSize ? `${fontSize}px` : "48px",
          color: "white",
          opacity: 0.8,
        }}
      />
    </div>
  );
};
