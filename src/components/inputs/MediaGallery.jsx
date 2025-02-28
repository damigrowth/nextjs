"use client";

import Image from "next/image";
import { useState, useEffect, useCallback, useRef } from "react";

export default function MediaGallery({
  initialMedia = [],
  onSave,
  onUpdate,
  onDelete,
  isPending = false,
  custom = false,
  maxSize = 15, // MB
  maxVideos = 3,
  maxAudio = 3,
  showSaveButton = true,
  saveEndpoint,
  labels = {
    title: "Φωτογραφίες - Βίντεο - Ήχοι",
    selectFiles: "Επιλογή αρχείων",
    dragAndDrop: "Σύρετε τα αρχεία σας εδώ, ή κάντε κλικ για να τα επιλέξετε",
    maxSizeText: "Το μέγιστο επιτρεπτό μέγεθος αρχείων είναι",
    currentSize: "Τρέχον μέγεθος:",
    maxVideosText: "Μέχρι",
    videosOrAudio: "βίντεο η ήχους",
    saving: "Αποθήκευση...",
    save: "Αποθήκευση",
    maxVideosError: "Μέγιστος αριθμός βίντεο:",
    maxAudioError: "Μέγιστος αριθμός ήχων:",
    sizeExceededError: "Το συνολικό μέγεθος των αρχείων υπερβαίνει τα",
    saveError: "Σφάλμα κατά την αποθήκευση των αρχείων",
    browserNotSupported:
      "Το πρόγραμμα περιήγησης σας δεν υποστηρίζει το tag βίντεο.",
    unsupportedFile: "Λυπούμαστε, αυτός ο τύπος αρχείου δεν επιτρέπεται.",
    fileCount: {
      singular: "αρχείο",
      plural: "αρχεία",
    },
  },
}) {
  const [media, setMedia] = useState([]);
  const [deletedMediaIds, setDeletedMediaIds] = useState([]);
  const [totalSize, setTotalSize] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // We use this flag to prevent calling onUpdate during initial setup
  const isInitialized = useRef(false);

  // We use this flag to track when changes were made by user actions
  // rather than from props/initialMedia
  const userActionPerformed = useRef(false);

  // Format media to ensure consistent structure
  const formatMediaItem = useCallback((item) => {
    // If item is already properly formatted (has file property)
    if (item?.file) return item;

    // If it's a File object, format it as new upload
    if (item instanceof File) {
      return {
        file: item,
        url: URL.createObjectURL(item),
      };
    }

    // Otherwise, assume it's from API and format it appropriately
    return {
      file: item,
      url: item?.attributes?.url,
    };
  }, []);

  // Initialize media from props - only runs once
  useEffect(() => {
    if (!isInitialized.current && initialMedia?.length > 0) {
      // Ensure all media items have consistent structure
      const formattedMedia = initialMedia.map(formatMediaItem).filter(Boolean);
      setMedia(formattedMedia);
      isInitialized.current = true;
    }
  }, [initialMedia, formatMediaItem]);

  // Cleanup blob URLs when component unmounts
  useEffect(() => {
    return () => {
      media.forEach((item) => {
        if (item?.url?.startsWith("blob:")) {
          URL.revokeObjectURL(item.url);
        }
      });
    };
  }, [media]);

  // Calculate total size including existing and new media
  useEffect(() => {
    const calculateSize = () => {
      const newTotalSize = media.reduce((sum, item) => {
        // Handle new uploads (File objects) - convert from bytes to MB
        if (item?.file instanceof File) {
          return sum + item.file.size / (1024 * 1024);
        }
        // Handle existing Strapi media
        else if (item?.file?.attributes) {
          // Check for direct size attribute (server returns sizes in KB)
          if (typeof item.file.attributes.size === "number") {
            // Convert KB to MB
            return sum + item.file.attributes.size / 1024;
          }

          // Fallback: If no direct size attribute, check formats
          if (item.file.attributes.formats) {
            // Try formats in order of preference
            const formats = [
              "original",
              "large",
              "medium",
              "small",
              "thumbnail",
            ];
            for (const format of formats) {
              if (item.file.attributes.formats[format]?.size) {
                // Convert KB to MB (server returns sizes in KB)
                return sum + item.file.attributes.formats[format].size / 1024;
              }
            }
          }

          // Last resort: estimate based on mime type if no size found
          if (item.file.attributes.mime) {
            if (item.file.attributes.mime.startsWith("image/")) {
              return sum + 0.5; // ~0.5MB for images
            } else if (item.file.attributes.mime.startsWith("video/")) {
              return sum + 5; // ~5MB for videos
            } else if (item.file.attributes.mime.startsWith("audio/")) {
              return sum + 2; // ~2MB for audio
            }
          }
        }
        return sum;
      }, 0);
      setTotalSize(newTotalSize);
    };

    calculateSize();
  }, [media]);

  // Update parent component when media changes - BUT ONLY AFTER USER ACTIONS
  useEffect(() => {
    // Skip if not fully initialized yet
    if (!isInitialized.current) return;

    // Only notify parent when changes were made by user actions
    if (userActionPerformed.current && onUpdate) {
      onUpdate(media, deletedMediaIds);
      // Reset the flag after notifying
      userActionPerformed.current = false;
    }
  }, [media, deletedMediaIds, onUpdate]);

  const clearError = useCallback(() => {
    setError("");
  }, []);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(clearError, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  const getMediaType = useCallback((fileType) => {
    if (typeof fileType === "string") {
      if (fileType.startsWith("image/")) return "image";
      if (fileType.startsWith("video/")) return "video";
      if (fileType.startsWith("audio/")) return "audio";
    }
    return "unknown";
  }, []);

  const handleDropMedia = useCallback(
    (files) => {
      // Flag that this is a user action
      userActionPerformed.current = true;

      const newFiles = [];
      let newTotalSize = totalSize;

      // Count existing media types
      const videoCount = media.filter((item) => {
        const type =
          item?.file instanceof File
            ? item.file.type
            : item?.file?.attributes?.mime;
        return getMediaType(type) === "video";
      }).length;

      const audioCount = media.filter((item) => {
        const type =
          item?.file instanceof File
            ? item.file.type
            : item?.file?.attributes?.mime;
        return getMediaType(type) === "audio";
      }).length;

      for (const file of files) {
        const mediaType = getMediaType(file.type);

        if (
          mediaType === "video" &&
          videoCount +
            newFiles.filter((item) => getMediaType(item.file.type) === "video")
              .length >=
            maxVideos
        ) {
          setError(`${labels.maxVideosError} ${maxVideos}`);
          continue;
        }

        if (
          mediaType === "audio" &&
          audioCount +
            newFiles.filter((item) => getMediaType(item.file.type) === "audio")
              .length >=
            maxAudio
        ) {
          setError(`${labels.maxAudioError} ${maxAudio}`);
          continue;
        }

        const fileSize = file.size / (1024 * 1024);
        if (newTotalSize + fileSize > maxSize) {
          setError(`${labels.sizeExceededError} ${maxSize}MB`);
          break;
        }

        const blob = URL.createObjectURL(file);
        newFiles.push({ file, url: blob });
        newTotalSize += fileSize;
      }

      if (newFiles.length > 0) {
        setMedia((prevMedia) => [
          ...prevMedia,
          ...newFiles.filter(
            (item) =>
              !prevMedia.some(
                (f) =>
                  f?.file instanceof File &&
                  item?.file instanceof File &&
                  f.file.name === item.file.name
              )
          ),
        ]);
        setTotalSize(newTotalSize);
      }
    },
    [media, totalSize, getMediaType, maxVideos, maxAudio, maxSize, labels]
  );

  // Default save implementation if no onSave is provided
  const defaultSaveGallery = useCallback(async () => {
    if (!saveEndpoint) {
      console.error("No save endpoint provided");
      return false;
    }

    try {
      const formData = new FormData();

      // Add new files
      const newFiles = media.filter((item) => item?.file instanceof File);
      newFiles.forEach((item) => {
        formData.append("files", item.file);
      });

      // Add info about existing and deleted files
      const existingFileIds = media
        .filter((item) => item?.file?.attributes && item?.file?.id)
        .map((item) => item.file.id);

      formData.append("existingFiles", JSON.stringify(existingFileIds));
      formData.append("deletedFiles", JSON.stringify(deletedMediaIds));

      const response = await fetch(saveEndpoint, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to save media");
      }

      return true;
    } catch (error) {
      console.error("Error saving gallery:", error);
      return false;
    }
  }, [media, deletedMediaIds, saveEndpoint]);

  const handleMediaSave = useCallback(async () => {
    setLoading(true);
    try {
      // Use provided onSave callback if available, otherwise use default implementation
      const result = onSave
        ? await onSave(media, deletedMediaIds)
        : await defaultSaveGallery();

      if (result !== false) {
        // Reset deletedMediaIds after successful save
        setDeletedMediaIds([]);
      } else {
        setError(labels.saveError);
      }
    } catch (error) {
      console.error("Error in handleMediaSave:", error);
      setError(labels.saveError);
    } finally {
      setLoading(false);
    }
  }, [media, deletedMediaIds, onSave, defaultSaveGallery, labels.saveError]);

  const handleMediaDelete = useCallback(
    (item) => {
      // Flag that this is a user action
      userActionPerformed.current = true;

      // Call the onDelete callback if provided
      if (onDelete) {
        onDelete(item);
      }

      if (item?.file?.attributes) {
        // For existing Strapi media, use the ID
        const id = item.file.id;

        // Only add to deletedMediaIds if it's a numeric ID (Strapi convention)
        if (id && (typeof id === "string" || typeof id === "number")) {
          setDeletedMediaIds((prev) => [...prev, id.toString()]);
        }

        // Remove from media array
        setMedia((prev) => prev.filter((m) => m?.file?.id !== id));
      } else if (item?.file instanceof File) {
        // For new uploads, use the filename
        setMedia((prev) =>
          prev.filter(
            (m) => !(m?.file instanceof File && m.file.name === item.file.name)
          )
        );

        // Revoke blob URL if it exists
        if (item?.url?.startsWith("blob:")) {
          URL.revokeObjectURL(item.url);
        }
      }
    },
    [onDelete]
  );

  const renderMediaPreview = useCallback(
    (item) => {
      // Safety check to prevent errors
      if (!item || !item.file) {
        return <p>{labels.unsupportedFile}</p>;
      }

      // For existing media from Strapi
      if (item.file.attributes) {
        // Determine media type based on available information
        let mediaType = "unknown";
        const mime = item.file.attributes.mime;

        // First try to use the mime type directly if available
        if (mime) {
          mediaType = getMediaType(mime);
        }
        // Then try to get mime type from formats if available
        else if (
          item.file.attributes.formats &&
          Object.keys(item.file.attributes.formats).length > 0
        ) {
          // If it has formats, it's likely an image
          const format = Object.values(item.file.attributes.formats)[0];
          if (format && format.mime) {
            mediaType = getMediaType(format.mime);
          }
        }
        // Otherwise try to guess from the URL or file extension
        else if (item.file.attributes.url) {
          const url = item.file.attributes.url;
          let urlPath;

          try {
            urlPath = new URL(url).pathname;
          } catch (e) {
            // If URL parsing fails, just use the url string
            urlPath = url;
          }

          // Check if URL contains video/upload and ends with audio extension
          if (
            urlPath.includes("/video/upload/") &&
            (urlPath.endsWith(".mp3") ||
              urlPath.endsWith(".wav") ||
              urlPath.endsWith(".ogg") ||
              urlPath.endsWith(".m4a"))
          ) {
            mediaType = "audio";
          }
          // Check for video extensions
          else if (
            urlPath.endsWith(".mp4") ||
            urlPath.endsWith(".webm") ||
            urlPath.endsWith(".mov") ||
            urlPath.endsWith(".avi")
          ) {
            mediaType = "video";
          }
          // Check if URL contains image/upload (Cloudinary pattern)
          else if (urlPath.includes("/image/upload/")) {
            mediaType = "image";
          }
        }

        // Get the URL from attributes
        const url = item.file.attributes.url;
        if (!url) {
          return <p>{labels.unsupportedFile}</p>;
        }

        switch (mediaType) {
          case "image":
            return (
              <Image
                height={119}
                width={136}
                className="object-fit-cover"
                src={url}
                style={{ height: "166px", width: "190px" }}
                alt={item.file.attributes.name || "image"}
              />
            );
          case "video":
            return (
              <video
                className="object-fit-cover"
                style={{ height: "166px", width: "190px" }}
                controls
              >
                <source src={url} type={mime || "video/mp4"} />
                {labels.browserNotSupported}
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
                <audio controls className="mt-2">
                  <source src={url} type={mime || "audio/mpeg"} />
                </audio>
              </div>
            );
          default:
            return <p>{labels.unsupportedFile}</p>;
        }
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
                {labels.browserNotSupported}
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
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#f0f0f0",
                }}
              >
                <i className="fa-solid fa-music fa-3x"></i>
                <audio controls className="mt-2">
                  <source src={item.url} type={item.file.type} />
                </audio>
              </div>
            );
          default:
            return <p>{labels.unsupportedFile}</p>;
        }
      }

      return <p>{labels.unsupportedFile}</p>;
    },
    [getMediaType, labels]
  );

  return (
    <>
      <div
        className={
          !custom
            ? `ps-widget bdrs12 p30 mb30 overflow-hidden position-relative ${
                isPending ? "section-disabled" : ""
              }`
            : `ps-widget overflow-hidden position-relative ${
                isPending ? "section-disabled" : ""
              }`
        }
      >
        {!custom && (
          <div className="bdrb1 pb15">
            <h5 className="list-title">{labels.title}</h5>
          </div>
        )}

        <div className="dropzone-container">
          <span className="fz30">📁</span>
          <input
            type="file"
            name="media-files"
            id="media-files"
            accept="image/*,video/*,audio/*"
            placeholder={labels.selectFiles}
            multiple
            onChange={(e) => handleDropMedia(Array.from(e.target.files))}
            className="dropzone"
          />

          <div className="mt10">
            {media.length === 0 ? (
              <p className="fz14 mb0">{labels.selectFiles}</p>
            ) : (
              <p className="fz14">
                Έχετε επιλέξει {media.length}{" "}
                {media.length === 1
                  ? labels.fileCount.singular
                  : labels.fileCount.plural}
              </p>
            )}

            {media.length < 1 && (
              <p className="fz16 mb5">{labels.dragAndDrop}</p>
            )}

            <div>
              <p className="fz12 mb0">
                {labels.maxSizeText} <span className="fw600">{maxSize}MB</span>{" "}
                ({labels.currentSize}{" "}
                <span className="fw600">{totalSize.toFixed(2)}MB</span>)
              </p>
              <p className="fz12 mb0">
                {labels.maxVideosText}{" "}
                <span className="fw600">{maxVideos}</span>{" "}
                {labels.videosOrAudio}
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
                      <a
                        className="icon"
                        onClick={() => handleMediaDelete(item)}
                      >
                        <span className="flaticon-delete" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {!custom && showSaveButton && (
          <button
            type="button"
            className="ud-btn no-rotate btn-thm"
            disabled={isPending}
            onClick={handleMediaSave}
          >
            {loading ? labels.saving : labels.save}
            {loading ? (
              <div
                className="spinner-border spinner-border-sm ml10"
                role="status"
              >
                <span className="sr-only"></span>
              </div>
            ) : (
              <i className="fa-solid fa-floppy-disk"></i>
            )}
          </button>
        )}
      </div>
    </>
  );
}
