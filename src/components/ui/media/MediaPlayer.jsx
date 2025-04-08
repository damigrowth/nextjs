import { getMediaType } from "@/utils/media";

export const MediaPlayer = ({ url }) => {
  const mediaType = getMediaType(url);

  switch (mediaType) {
    case "video":
      return (
        <video controls preload="none" className="w100">
          <source src={url} type={`video/${url.split(".").pop()}`} />
          Your browser does not support the video tag.
        </video>
      );
    case "audio":
      // Return null for audio files to prevent rendering
      return null;
    case "unknown":
      return (
        <div className="p-4 bg-red-100 text-red-600">
          Unsupported media format
        </div>
      );
    default:
      return null;
  }
};
