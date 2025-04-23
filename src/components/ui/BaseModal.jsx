"use client";

import { useState, useEffect } from "react";
import useModalCleanup from "@/hook/useModalCleanup";

/**
 * Base modal component with proper accessibility and cleanup
 *
 * @param {Object} props - Component props
 * @param {string} props.id - The modal's ID (must be unique)
 * @param {string} [props.title] - Modal title
 * @param {React.ReactNode} props.children - Modal content
 * @param {string} [props.size] - Modal size (sm, lg, xl)
 * @param {boolean} [props.centered=true] - Whether the modal should be vertically centered
 * @param {boolean} [props.showCloseButton=true] - Whether to show the close button
 * @param {string} [props.closeButtonLabel="Κλείσιμο"] - Close button aria label
 * @returns {JSX.Element} Accessible modal component
 */
export default function BaseModal({
  id,
  title,
  children,
  size,
  centered = true,
  showCloseButton = true,
  closeButtonLabel = "Κλείσιμο",
}) {
  // Use the modal cleanup hook
  useModalCleanup(id);

  // Construct dialog class names
  const dialogClasses = [
    "modal-dialog",
    centered && "modal-dialog-centered",
    size && `modal-${size}`,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className="modal fade"
      id={id}
      tabIndex={-1}
      aria-labelledby={`${id}Label`}
    >
      <div className={dialogClasses}>
        <div className="modal-content position-relative">
          {showCloseButton && (
            <button
              type="button"
              className="btn-close position-absolute no-rotate btn-raw"
              data-bs-dismiss="modal"
              aria-label={closeButtonLabel}
              style={{ top: "10px", right: "10px", zIndex: "9" }}
            />
          )}

          {title && (
            <div className="modal-header">
              <h4 className="modal-title" id={`${id}Label`}>
                {title}
              </h4>
            </div>
          )}

          <div className="modal-body px-4 pt-5">{children}</div>
        </div>
      </div>
    </div>
  );
}
