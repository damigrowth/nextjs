"use client";

import StartChatForm from "../ui/forms/StartChatForm";

/**
 * Modal component that contains the form for starting a new chat with a freelancer
 * @param {Object} props - Component props
 * @param {string|number} props.fid - ID of the current user
 * @param {string|number} props.freelancerId - ID of the target freelancer to chat with
 * @param {string} props.displayName - Display name of the target freelancer
 * @returns {JSX.Element} Modal containing a chat form
 */
export default function StartChatModal({ fid, freelancerId, displayName }) {
  return (
    <div
      className="modal fade"
      id="startChatModal"
      tabIndex={-1}
      aria-labelledby="startChatModalLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content position-relative">
          <button
            type="button"
            className="btn-close position-absolute no-rotate btn-raw"
            data-bs-dismiss="modal"
            aria-label="Κλείσιμο"
            style={{ top: "10px", right: "10px", zIndex: "9" }}
          />

          <div className="modal-body px-4 pt-5">
            <div className="pb10">
              <h4 className="text-black mb-3">Νέο Μήνυμα προς {displayName}</h4>
            </div>
            <div className="row justify-content-center align-items-center">
              <StartChatForm fid={fid} freelancerId={freelancerId} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
