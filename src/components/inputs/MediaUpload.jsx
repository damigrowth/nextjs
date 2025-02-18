import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import Image from "next/image";

// Create a context for media management
const MediaContext = createContext(null);

// Utility function to format file sizes
function formatFileSize(sizeInBytes) {
  const size = Number(sizeInBytes);

  if (isNaN(size) || size <= 0) return "0 KB";

  if (size < 1024) {
    return `${size.toFixed(2)} B`;
  } else if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(2)} KB`;
  } else {
    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  }
}

// Function to calculate file size
function calculateEstimatedSize(mediaItem) {
  // For local File uploads
  if (mediaItem instanceof File) {
    return mediaItem.size / (1024 * 1024);
  }

  // For Strapi/Cloudinary media
  if (mediaItem.attributes) {
    // Use the size attribute directly
    const size = mediaItem.attributes.size;

    // Convert to MB, ensuring it's a number
    const sizeInMB = Number(size) / (1024 * 1024);

    // Return size or fallback
    return !isNaN(sizeInMB) && sizeInMB > 0 ? sizeInMB : 0.5;
  }

  // Default to 0.5 MB if no size information is available
  return 0.5;
}

// Media Provider Component
export function MediaProvider({ children, initialMedia = [] }) {
  const [originalMedia, setOriginalMedia] = useState(
    initialMedia.map((item) => ({
      file: item,
      url: item.attributes?.url || "",
      original: true,
      estimatedSize: calculateEstimatedSize(item),
    }))
  );
  const [media, setMedia] = useState(
    initialMedia.map((item) => ({
      file: item,
      url: item.attributes?.url || "",
      original: true,
      estimatedSize: calculateEstimatedSize(item),
    }))
  );
  const [deletedMediaIds, setDeletedMediaIds] = useState([]);
  const [totalSize, setTotalSize] = useState(0);
  const [error, setError] = useState("");

  // Reset state when initialMedia changes
  useEffect(() => {
    const formattedMedia = initialMedia.map((item) => ({
      file: item,
      url: item.attributes?.url || "",
      original: true,
      estimatedSize: calculateEstimatedSize(item),
    }));

    setOriginalMedia(formattedMedia);
    setMedia(formattedMedia);
    setDeletedMediaIds([]);
  }, [initialMedia]);

  // Calculate total media size when media changes
  useEffect(() => {
    const calculateSize = () => {
      const newTotalSize = media.reduce((sum, item) => {
        // For new File uploads
        if (item.file instanceof File) {
          return sum + item.file.size / (1024 * 1024);
        }

        // For existing media, use estimated size
        return sum + (item.estimatedSize || 0.5);
      }, 0);

      setTotalSize(newTotalSize);
    };

    calculateSize();
  }, [media]);

  // Clear error after 3 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Detect changes
  const mediaChanges = useMemo(() => {
    // New files added (not original)
    const newFiles = media.filter((item) => !item.original);

    // Explicitly compare current media with original media
    const currentMediaIds = media
      .filter((item) => item.file.attributes)
      .map((item) => item.file.id);

    const originalMediaIds = originalMedia.map((item) => item.file.id);

    // Deleted media are those in original that are not in current
    const deletedFiles = originalMedia.filter(
      (origItem) => !currentMediaIds.includes(origItem.file.id)
    );

    // Determine if there are changes
    const hasChanges =
      newFiles.length > 0 ||
      deletedFiles.length > 0 ||
      currentMediaIds.length !== originalMediaIds.length;

    return {
      newFiles: newFiles.map((item) => item.file),
      deletedFiles: deletedFiles.map((item) => item.file),
      hasChanges,
    };
  }, [media, originalMedia]);

  // Get media type utility
  const getMediaType = (fileType) => {
    if (typeof fileType === "string") {
      if (fileType.startsWith("image/")) return "image";
      if (fileType.startsWith("video/")) return "video";
      if (fileType.startsWith("audio/")) return "audio";
    }
    return "unknown";
  };

  // Add media with validation
  const addMedia = (files) => {
    const newFiles = [];
    let newTotalSize = totalSize;

    // Count existing media types
    const videoCount = media.filter((item) => {
      const type =
        item.file instanceof File
          ? item.file.type
          : item.file?.attributes?.mime;
      return getMediaType(type) === "video";
    }).length;

    const audioCount = media.filter((item) => {
      const type =
        item.file instanceof File
          ? item.file.type
          : item.file?.attributes?.mime;
      return getMediaType(type) === "audio";
    }).length;

    for (const file of files) {
      const mediaType = getMediaType(file.type);

      // Validate video count
      if (
        mediaType === "video" &&
        videoCount +
          newFiles.filter((item) => getMediaType(item.file.type) === "video")
            .length >=
          3
      ) {
        setError("Μέγιστος αριθμός βίντεο: 3");
        continue;
      }

      // Validate audio count
      if (
        mediaType === "audio" &&
        audioCount +
          newFiles.filter((item) => getMediaType(item.file.type) === "audio")
            .length >=
          3
      ) {
        setError("Μέγιστος αριθμός ήχων: 3");
        continue;
      }

      // Validate total size
      const fileSize = file.size / (1024 * 1024);
      if (newTotalSize + fileSize > 15) {
        setError("Το συνολικό μέγεθος των αρχείων υπερβαίνει τα 15MB");
        break;
      }

      const blob = file instanceof File ? URL.createObjectURL(file) : file.url;

      newFiles.push({
        file,
        url: blob,
        original: !(file instanceof File),
        estimatedSize: calculateEstimatedSize(file),
      });
      newTotalSize += fileSize;
    }

    if (newFiles.length > 0) {
      setMedia((prevMedia) => [
        ...prevMedia,
        ...newFiles.filter(
          (newItem) =>
            !prevMedia.some(
              (existingItem) =>
                (existingItem.file instanceof File &&
                  existingItem.file.name === newItem.file.name) ||
                (existingItem.file.attributes &&
                  existingItem.file.id === newItem.file.id)
            )
        ),
      ]);
    }
  };

  // Delete media
  const deleteMedia = (item) => {
    // For originally existing media, track deleted IDs
    if (item.file.attributes) {
      setDeletedMediaIds((prev) => [...prev, item.file.id]);
    }

    setMedia((prevMedia) =>
      prevMedia.filter((mediaItem) => {
        // For Strapi media
        if (item.file.attributes) {
          return item.file.id !== mediaItem.file.id;
        }
        // For new uploads
        return item.file.name !== mediaItem.file.name;
      })
    );

    // Revoke blob URL if it exists
    if (item.url?.startsWith("blob:")) {
      URL.revokeObjectURL(item.url);
    }
  };

  // Render media preview
  const renderMediaPreview = (item) => {
    // For existing media from Strapi
    if (item.file.attributes) {
      return (
        <Image
          height={119}
          width={136}
          className="object-fit-cover"
          src={item.file.attributes.url}
          style={{ height: "166px", width: "190px" }}
          alt={item.file.attributes.name}
        />
      );
    }

    // For new uploads
    if (item.file instanceof File) {
      const mediaType = getMediaType(item.file.type);

      switch (mediaType) {
        case "image":
          return (
            <Image
              height={119}
              width={136}
              className="object-fit-cover"
              src={item.url}
              style={{ height: "166px", width: "190px" }}
              alt={item.file.name}
            />
          );
        case "video":
          return (
            <video
              className="object-fit-cover"
              style={{ height: "166px", width: "190px" }}
              controls
            >
              <source src={item.url} type={item.file.type} />
              Το πρόγραμμα περιήγησης σας δεν υποστηρίζει το tag βίντεο.
            </video>
          );
        case "audio":
          return (
            <div
              className="audio-preview"
              style={{
                height: "166px",
                width: "190px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#f0f0f0",
              }}
            >
              <i className="fa-solid fa-music fa-3x"></i>
            </div>
          );
      }
    }

    return <p>Λυπούμαστε, αυτός ο τύπος αρχείου δεν επιτρέπεται.</p>;
  };

  // Reset media
  const resetMedia = () => {
    // Revoke any existing blob URLs
    media.forEach((item) => {
      if (item.url?.startsWith("blob:")) {
        URL.revokeObjectURL(item.url);
      }
    });
    setMedia(originalMedia);
    setDeletedMediaIds([]);
  };

  return (
    <MediaContext.Provider
      value={{
        media,
        addMedia,
        deleteMedia,
        renderMediaPreview,
        resetMedia,
        totalSize,
        error,
        mediaChanges,
        deletedMediaIds,
        formatFileSize,
      }}
    >
      {children}
    </MediaContext.Provider>
  );
}

// Custom hook to use media context
export function useMediaUpload() {
  const context = useContext(MediaContext);
  if (!context) {
    throw new Error("useMediaUpload must be used within a MediaProvider");
  }
  return context;
}

// Media Upload Component
export function MediaUpload({
  context = "default",
  onMediaChange,
  isPending = false,
}) {
  const {
    media,
    addMedia,
    deleteMedia,
    renderMediaPreview,
    totalSize,
    error,
    mediaChanges,
    formatFileSize,
    deletedMediaIds,
  } = useMediaUpload();

  // Update parent component when media changes
  useEffect(() => {
    if (onMediaChange) {
      onMediaChange(media, mediaChanges, context);
    }
  }, [media, mediaChanges, onMediaChange, context]);

  // Calculate total file size
  const totalFileSize = media.reduce((total, item) => {
    const size =
      item.file instanceof File
        ? item.file.size
        : item.file.attributes?.size || 0;
    return total + size;
  }, 0);

  return (
    <div
      className={`ps-widget overflow-hidden position-relative ${
        isPending ? "section-disabled" : ""
      }`}
    >
      <div className="dropzone-container">
        <span className="fz30">📁</span>
        <input
          type="file"
          name={`media-files-${context}`}
          id={`media-files-${context}`}
          accept="image/*,video/*,audio/*"
          placeholder="Επιλογή αρχείων"
          multiple
          onChange={(e) => addMedia(Array.from(e.target.files))}
          className="dropzone"
          disabled={isPending}
        />

        <div className="mt10">
          {media.length === 0 ? (
            <p className="fz14 mb0">Επιλογή αρχείων</p>
          ) : (
            <p className="fz14">
              Έχετε επιλέξει {media.length}{" "}
              {media.length === 1 ? "αρχείο" : "αρχεία"}
            </p>
          )}

          {media.length < 1 && (
            <p className="fz16 mb5">
              Σύρετε τα αρχεία σας εδώ, ή κάντε κλικ για να τα επιλέξετε
            </p>
          )}

          <div>
            <p className="fz12 mb0">
              Το μέγιστο επιτρεπτό μέγεθος αρχείων είναι{" "}
              <span className="fw600">15MB</span> (Τρέχον μέγεθος:{" "}
              <span className="fw600">{formatFileSize(totalFileSize)}</span>)
            </p>
            <p className="fz12 mb0">
              Μέχρι <span className="fw600">3</span> βίντεο η ήχους
            </p>
            <p className="text-danger mb0" style={{ height: "10px" }}>
              {error ? error : " "}
            </p>
          </div>
        </div>

        <div className="gallery">
          {media.map((item, i) => (
            <div
              key={i}
              className="gallery-item bdrs4 overflow-hidden position-relative"
            >
              {renderMediaPreview(item)}
              <div className="del-edit">
                <div className="d-flex justify-content-center">
                  {!isPending && (
                    <a className="icon" onClick={() => deleteMedia(item)}>
                      <span className="flaticon-delete" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
