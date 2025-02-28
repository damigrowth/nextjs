"use client";

import Image from "next/image";
import React, { useState, useEffect, useCallback } from "react";

export default function ProfileImageInput({ image, onChange, errors }) {
  const [error, setError] = useState("");
  const [previewUrl, setPreviewUrl] = useState(null);

  // Clear error after 3 seconds
  const clearError = useCallback(() => {
    setError("");
  }, []);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(clearError, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  // Clean up blob URL when component unmounts or when previewUrl changes
  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      // File size validation (1MB limit)
      const fileSize = file.size / (1024 * 1024);
      if (fileSize > 1) {
        setError("Το μέγεθος του αρχείου πρέπει να είναι μικρότερο από 1MB");
        return;
      }

      // File type validation
      if (!file.type.startsWith("image/")) {
        setError("Επιτρέπονται μόνο αρχεία εικόνας");
        return;
      }

      if (!["image/jpeg", "image/png"].includes(file.type)) {
        setError("Επιτρέπονται μόνο αρχεία .jpg και .png");
        return;
      }

      // Create blob URL for preview
      if (previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
      const blob = URL.createObjectURL(file);
      setPreviewUrl(blob);
      setError("");
      onChange(file);
    }
  };

  const handleDelete = () => {
    if (previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setError("");
    onChange(null);
  };

  // Get image source - either the preview URL, passed URL, or default
  const getImageSource = () => {
    if (previewUrl) {
      return previewUrl;
    }
    if (image) {
      return image;
    }
    return "/images/team/fl-1.png";
  };

  // Determine if there's a current image
  const hasImage = Boolean(image || previewUrl);

  return (
    <div className="col-xl-7">
      <div className="profile-box d-sm-flex align-items-center mb30">
        <div className="profile-img mb20-sm">
          <Image
            height={142}
            width={142}
            className="rounded-circle wa-xs"
            src={getImageSource()}
            style={{
              height: "71px",
              width: "71px",
              objectFit: "cover",
            }}
            alt="Εικόνα προφίλ"
          />
        </div>
        <div className="profile-content ml20 ml0-xs">
          <div className="d-flex flex-column">
            <div className="d-flex align-items-center">
              {/* <a
                className="tag-delt text-thm2 cursor-pointer"
                onClick={handleDelete}
              >
                <span className="flaticon-delete text-thm2" />
              </a> */}
              <label className="mb0">
                <input
                  type="file"
                  accept=".png, .jpg, .jpeg"
                  className="d-none"
                  onChange={handleImageChange}
                />
                <a className="upload-btn cursor-pointer">
                  <span className="flaticon-photo-camera mr5"></span>
                  {hasImage ? "Αλλαγή Εικόνας" : "Μεταφόρτωση Εικόνας"}
                </a>
              </label>
            </div>
            {(error || errors) && (
              <p className="text-danger fs-14 ml10 mb0 mt-1">
                {error || errors}
              </p>
            )}
          </div>
          <p className="text fz13 mb-0 mt-2">
            Μέγιστο μέγεθος αρχείου: 1MB, Ελάχιστες διαστάσεις: 80x80.
            Επιτρεπόμενοι τύποι αρχείων: .jpg & .png
          </p>
        </div>
      </div>
    </div>
  );
}
