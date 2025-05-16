"use client";

import React from "react";

/**
 * FreelancerReportModal component provides a modal dialog for freelancer reports.
 * @param {object} props - Component props.
 * @param {React.ReactNode} props.children - The content to display within the modal body.
 * @param {React.RefObject} props.closeButtonRef - Ref for the close button, allowing programmatic closing.
 * @returns {JSX.Element} The freelancer report modal component.
 */
export default function FreelancerReportModal({ children, closeButtonRef }) {
  return (
    <div
      className="modal fade"
      id="freelancerReportModal" // Unique ID for this modal
      tabIndex={-1}
      aria-labelledby="freelancerReportModalLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="freelancerReportModalLabel">
              Αναφορά Προφίλ
            </h5>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
              ref={closeButtonRef}
            />
          </div>
          <div className="modal-body">{children}</div>
        </div>
      </div>
    </div>
  );
}
