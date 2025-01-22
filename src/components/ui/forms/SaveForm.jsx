"use client";

import { saveCollectionEntry, unsaveCollectionEntry } from "@/lib/save";
import { useActionState } from "react";

export default function SaveForm({
  type,
  id,
  initialSavedStatus = false,
  showDelete = false,
  className = "",
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

  return (
    <form action={saved ? unsaveAction : saveAction} className="flex">
      <input type="hidden" name="type" value={type} />
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        disabled={isSavePending || isUnsavePending}
        className={`listing-fav fz12 btn ${
          saved ? "ui-fav-active" : ""
        } ${className}`}
        style={{ zIndex: 100 }}
      >
        <span
          className={`far fa-heart ${
            isSavePending || isUnsavePending ? "opacity-50" : ""
          }`}
        />
      </button>

      {(saveState?.errors?.general || unsaveState?.errors?.general) && (
        <span className="text-red-500 text-sm">
          {saveState?.errors?.general || unsaveState?.errors?.general}
        </span>
      )}
    </form>
  );
}
