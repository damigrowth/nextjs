"use client";

import React, { useActionState } from "react";
import Input from "../../inputs/Input";
import FormButton from "../buttons/FormButton";
import { resetPassword } from "@/lib/auth";

const ResetPasswordForm = ({ resetCode }) => {
  const [state, formAction, isPending] = useActionState(resetPassword, {
    errors: {},
    message: null,
  });

  const handleSubmit = (formData) => {
    return formAction(formData);
  };

  return (
    <form action={handleSubmit}>
      <div className="mb15">
        <input type="hidden" name="resetCode" value={resetCode} />
        <Input
          state={state}
          label="Νέος Κωδικός"
          type="password"
          id="password"
          name="password"
          disabled={isPending}
          errorId="password-error"
          formatSpaces
        />
      </div>

      <div className="mb15">
        <Input
          state={state}
          label="Επιβεβαίωση Nέου Κωδικού"
          type="password"
          id="passwordConfirmation"
          name="passwordConfirmation"
          disabled={isPending}
          errorId="passwordConfirmation-error"
          formatSpaces
        />
      </div>

      {state?.message && (
        <div
          className={`mb20 ${state.success ? "text-success" : "text-danger"}`}
        >
          {state?.message}
        </div>
      )}

      <div className="d-grid mt40 mb20">
        <FormButton
          type="submit"
          disabled={isPending}
          loading={isPending}
          text="Αποθήκευση"
          icon="arrow"
        />
      </div>
    </form>
  );
};

export default ResetPasswordForm;
