"use client";

import { saveCollectionEntry, unsaveCollectionEntry } from "@/lib/save";
import { useActionState } from "react";

export default function SaveForm({
  type,
  id,
  initialSavedStatus = false,
  showDelete = false,
  className = "",
  variant = "heart",
}) {
  const [saveState, saveAction, isSavePending] = useActionState(
    saveCollectionEntry,
    { success: null, errors: {}, isSaved: initialSavedStatus }
  );

  const [unsaveState, unsaveAction, isUnsavePending] = useActionState(
    unsaveCollectionEntry,
    { success: null, errors: {}, isSaved: initialSavedStatus }
  );

  // Determine saved state from action results or initial state
  const saved =
    saveState?.success || (!unsaveState?.success && initialSavedStatus);
  const isLoading = isSavePending || isUnsavePending;

  if (showDelete) {
    return (
      <form action={unsaveAction} className="flex">
        <input type="hidden" name="type" value={type} />
        <input type="hidden" name="id" value={id} />
        <button
          type="submit"
          disabled={isUnsavePending}
          className="btn tag-del"
          style={{ zIndex: 100 }}
        >
          <span
            className={`flaticon-delete ${isUnsavePending ? "opacity-50" : ""}`}
          />
        </button>
      </form>
    );
  }

  const renderContent = () => {
    if (variant === "heart") {
      return (
        <span
          className={`${saved ? "fas fa-heart" : "far fa-heart"} ${
            isLoading ? "opacity-50" : ""
          }`}
        />
      );
    }

    return (
      <div
        className={`share-save-widget d-flex align-items-center ml15 ${
          saved ? "active" : ""
        }`}
      >
        <span
          className={`icon dark-color fz12 mr10 ${
            saved ? "fas fa-heart" : "far fa-heart"
          } ${saved ? "ui-fav-active" : ""}`}
        />
        <div className="h6 mb-0">{saved ? "Αποθηκεύτηκε" : "Αποθήκευση"}</div>
      </div>
    );
  };

  return (
    <form action={saved ? unsaveAction : saveAction} className="flex">
      <input type="hidden" name="type" value={type} />
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        disabled={isLoading}
        className={`${
          variant === "heart"
            ? `listing-fav fz12 btn ${saved ? "ui-fav-active" : ""}`
            : "btn-none"
        } ${className}`}
        style={{ zIndex: 100 }}
      >
        {renderContent()}
      </button>

      {(saveState?.errors?.general || unsaveState?.errors?.general) && (
        <span className="text-red-500 text-sm">
          {saveState?.errors?.general || unsaveState?.errors?.general}
        </span>
      )}
    </form>
  );
}
