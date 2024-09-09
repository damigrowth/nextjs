"use client";

import React, { useState } from "react";

export default function BreadcrumbButtons({ serviceTitle }) {
  const [shareToggle, setShareToggle] = useState(false);
  const [saveToggle, setSaveToggle] = useState(false);

  const currentUrl = typeof window !== "undefined" ? window.location.href : "";

  const handleShareClick = (platform) => {
    let shareUrl = "";
    switch (platform) {
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          currentUrl
        )}`;
        window.open(shareUrl, "_blank");
        break;
      case "linkedin":
        shareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(
          currentUrl
        )}`;
        window.open(shareUrl, "_blank");
        break;
      case "email":
        shareUrl = `mailto:?subject=${serviceTitle}?body=${encodeURIComponent(
          currentUrl
        )}`;
        window.location.href = shareUrl;
        break;
      case "copy":
        navigator.clipboard.writeText(currentUrl);
        break;
      default:
        break;
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-sm-end">
      <a
        onClick={() => setShareToggle(!shareToggle)}
        className="position-relative ui-share-toggle"
      >
        <div
          className={`share-save-widget d-flex align-items-center ${
            shareToggle ? "active" : ""
          }`}
        >
          <span className="icon flaticon-share dark-color fz12 mr10" />
          <div className="h6 mb-0">Κοινοποίηση</div>
        </div>
        {shareToggle && (
          <div className="ui-social-media">
            <a onClick={() => handleShareClick("facebook")}>
              <i className="fa-brands fa-facebook-f"></i>
            </a>
            <a onClick={() => handleShareClick("linkedin")}>
              <i className="fa-brands fa-linkedin-in"></i>
            </a>
            <a onClick={() => handleShareClick("email")}>
              <i className="fa-solid fa-envelope"></i>
            </a>
            <a onClick={() => handleShareClick("copy")}>
              <i className="fa-solid fa-link"></i>
            </a>
          </div>
        )}
      </a>
      <a onClick={() => setSaveToggle(!saveToggle)}>
        <div
          className={`share-save-widget d-flex align-items-center ml15 ${
            saveToggle ? "active" : ""
          }`}
        >
          <span className="icon flaticon-like dark-color fz12 mr10" />
          <div className="h6 mb-0">Αποθήκευση</div>
        </div>
      </a>
    </div>
  );
}
