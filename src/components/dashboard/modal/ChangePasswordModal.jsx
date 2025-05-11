"use client";

export default function ChangePasswordModal({
  id = "changePasswordModal",
  title = "Αλλαγή Κωδικού Πρόσβασης",
  children,
}) {
  return (
    <div
      className="modal fade"
      id={id}
      tabIndex={-1}
      aria-labelledby={`${id}Label`}
      aria-hidden="true"
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content position-relative">
          <button
            type="button"
            className="btn-close position-absolute no-rotate btn-raw"
            data-bs-dismiss="modal"
            aria-label="Close"
            style={{ top: "10px", right: "10px", zIndex: "9" }}
          />
          <div className="modal-header">
            <h5 className="modal-title" id={`${id}Label`}>
              {title}
            </h5>
          </div>
          <div className="modal-body">{children}</div>
        </div>
      </div>
    </div>
  );
}
