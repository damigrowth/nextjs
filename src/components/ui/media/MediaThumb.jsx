import { getMediaType } from "@/utils/media";

export const MediaThumb = ({ url }) => {
  const mediaType = getMediaType(url);
  return (
    <div
      style={{
        position: "relative",
        width: "300px",
        height: "300px",
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
          fontSize: "48px",
          color: "white",
          opacity: 0.8,
        }}
      />
    </div>
  );
};
