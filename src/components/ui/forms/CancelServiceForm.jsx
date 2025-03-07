"use client";

import DeleteModal from "@/components/dashboard/modal/DeleteModal";
import { useParams } from "next/navigation";
import React, { useActionState, useEffect, useRef } from "react";
import { cancelService } from "@/lib/service/cancel";

export default function CancelServiceForm() {
  const params = useParams();
  const formRef = useRef(null);
  const [formState, formAction, isPending] = useActionState(cancelService, {
    message: null,
    error: false,
  });

  useEffect(() => {
    if (formState.success) {
      // Navigate with a refresh by using window.location instead of router
      setTimeout(() => {
        window.location.href = "/dashboard/services";
      }, 300);
    }
  }, [formState.success]);

  const handleSubmit = (formData) => {
    formData.append("service-id", params.id);
    formAction(formData);
  };

  return (
    <div className="mt-4 pt-4 border-top">
      <h4 className="mb-3">Διαγραφή Υπηρεσίας</h4>
      <p className="text-muted mb-4">
        Προσοχή: Η διαγραφή της υπηρεσίας είναι μη αναστρέψιμη ενέργεια.
      </p>

      <button
        type="button"
        className="ud-btn btn-raw bg-danger text-white no-rotate"
        data-bs-toggle="modal"
        data-bs-target="#cancelServiceModal"
      >
        Διαγραφή
        <i className="fa-solid fa-trash ms-2"></i>
      </button>

      {formState?.message && (
        <div
          className={`alert ${
            formState.error ? "alert-danger" : "alert-success"
          } mt-3`}
        >
          {formState.message}
        </div>
      )}

      <form ref={formRef} action={handleSubmit}>
        <DeleteModal
          id="cancelServiceModal"
          title={
            <>
              Είσαι σίγουρος ότι θες
              <br />
              να διαγραφεί τελείως αυτή η υπηρεσία;
            </>
          }
          description={
            <>
              Η διαγραφή της υπηρεσίας είναι μη αναστρέψιμη ενέργεια.
              <br />
              Δεν θα μπορείτε να την επαναφέρετε αργότερα.
            </>
          }
          onConfirm={() => {
            formRef.current?.requestSubmit();
          }}
          isLoading={isPending}
        />
      </form>
    </div>
  );
}
