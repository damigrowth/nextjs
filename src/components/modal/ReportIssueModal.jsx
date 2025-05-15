"use client";

export default function ReportIssueModal({ children, closeButtonRef }) {
  return (
    <div
      className="modal fade"
      id="reportIssueModal"
      tabIndex={-1}
      aria-labelledby="reportIssueModalLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content position-relative">
          <button
            ref={closeButtonRef}
            type="button"
            className="btn-close position-absolute no-rotate btn-raw"
            data-bs-dismiss="modal"
            aria-label="Κλείσιμο"
            style={{ top: "10px", right: "10px", zIndex: "9" }}
          />

          <div className="modal-body px-4 pt-5 pb-4">
            <div className="pb10 text-center">
              <h4 className="text-black mb-2" id="reportIssueModalLabel">
                Αναφορά ζητήματος
              </h4>
              <p className="text-muted">
                Βοήθησε μας να βελτιώσουμε την εμπειρία στη Doulitsa.
              </p>
            </div>
            <div className="row justify-content-center align-items-center">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
