"use client";

import useCreateServiceStore from "@/store/service/create/createServiceStore";
import useEditServiceStore from "@/store/service/edit/editServiceStore";
import Image from "next/image";
import { useState, useEffect, useCallback } from "react";

export default function ServiceGallery({
  isPending,
  custom,
  editMode = false,
}) {
  const store = editMode ? useEditServiceStore : useCreateServiceStore;

  const {
    media,
    setMedia,
    mediaDelete,
    loading,
    setLoading,
    gallery,
    saveGallery,
  } = store();

  const [totalSize, setTotalSize] = useState(0);
  const [error, setError] = useState("");

  // Calculate total size including existing and new media
  useEffect(() => {
    const calculateSize = () => {
      const newTotalSize = media.reduce((sum, item) => {
        // Handle both new uploads and existing Strapi media
        if (item.file instanceof File) {
          return sum + item.file.size / (1024 * 1024);
        } else if (item.file?.attributes?.formats?.thumbnail?.size) {
          return sum + item.file.attributes.formats.thumbnail.size;
        }
        return sum;
      }, 0);
      setTotalSize(newTotalSize);
    };

    calculateSize();
  }, [media]);

  const clearError = useCallback(() => {
    setError("");
  }, []);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(clearError, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  const getMediaType = (fileType) => {
    if (typeof fileType === "string") {
      if (fileType.startsWith("image/")) return "image";
      if (fileType.startsWith("video/")) return "video";
      if (fileType.startsWith("audio/")) return "audio";
    }
    return "unknown";
  };

  const handleDropMedia = (files) => {
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

      const fileSize = file.size / (1024 * 1024);
      if (newTotalSize + fileSize > 15) {
        setError("Το συνολικό μέγεθος των αρχείων υπερβαίνει τα 15MB");
        break;
      }

      const blob = URL.createObjectURL(file);
      newFiles.push({ file, url: blob });
      newTotalSize += fileSize;
    }

    if (newFiles.length > 0) {
      setMedia(newFiles);
      setTotalSize(newTotalSize);
    }
  };

  const handleMediaSave = async () => {
    setLoading(true);
    try {
      await saveGallery();
    } catch (error) {
      setError("Σφάλμα κατά την αποθήκευση των αρχείων");
    }
    setLoading(false);
  };

  const handleMediaDelete = (item) => {
    if (item.file.attributes) {
      // For existing Strapi media, use the ID
      mediaDelete(item.file.id);
    } else if (item.file instanceof File) {
      // For new uploads, use the filename
      mediaDelete(item.file.name);
      if (item.url?.startsWith("blob:")) {
        URL.revokeObjectURL(item.url);
      }
    }
  };

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
            <h5 className="list-title">Φωτογραφίες - Βίντεο - Ήχοι</h5>
          </div>
        )}

        <div className="dropzone-container">
          <span className="fz30">📁</span>
          <input
            type="file"
            name="media-files"
            id="media-files"
            accept="image/*,video/*,audio/*"
            placeholder="Επιλογή αρχείων"
            multiple
            onChange={(e) => handleDropMedia(Array.from(e.target.files))}
            className="dropzone"
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
                <span className="fw600">{totalSize.toFixed(2)}MB</span>)
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
        {!custom && (
          <button
            type="button"
            className="ud-btn no-rotate btn-thm"
            disabled={isPending}
            onClick={handleMediaSave}
          >
            {loading ? "Αποθήκευση..." : "Αποθήκευση"}
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
