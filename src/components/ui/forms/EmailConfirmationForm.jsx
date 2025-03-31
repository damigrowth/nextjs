"use client";

import { completeRegistration } from "@/lib/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useActionState, useEffect } from "react";

export default function EmailConfirmationForm({ confirmationCode }) {
  const [state, formAction, isPending] = useActionState(completeRegistration, {
    success: false,
    message: "",
  });

  const router = useRouter();

  useEffect(() => {
    if (confirmationCode) {
      const submitForm = () => {
        const formData = new FormData();
        formData.set("code", confirmationCode);
        formAction(formData);
      };

      // Use startTransition to wrap the action dispatch
      React.startTransition(() => {
        submitForm();
      });
    }
  }, [confirmationCode, formAction]);

  // Handle redirect after successful confirmation
  useEffect(() => {
    if (state?.success && state?.redirect) {
      const timer = setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 2000); // Give user time to see success message

      return () => clearTimeout(timer);
    }
  }, [state, router]);

  if (isPending) {
    return (
      <div className="text-center">
        <div className="spinner-border text-thm mb-3" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="text-muted">Ταυτοποίηση σε εξέλιξη...</p>
      </div>
    );
  }

  if (state?.success) {
    return (
      <div className="text-center">
        <div className="text-thm2 mb-3">
          <i className="fa fa-check-circle fa-3x"></i>
        </div>
        <h4 className="text-thm2 mb-2">Επιτυχής Ταυτοποίηση!</h4>
        <p>{state.message}</p>
        <p className="text-muted">Ανακατεύθυνση στον πίνακα ελέγχου...</p>
      </div>
    );
  }

  if (state?.message) {
    return (
      <div className="text-center">
        <div className="text-danger mb-3">
          <i className="fa fa-exclamation-circle fa-3x"></i>
        </div>
        <p className="text-danger">{state.message}</p>
        <p className="mt-3">
          Εάν υπάρχει πρόβλημα επικοινωνήστε μαζί μας στο contact@doulitsa.gr και θα σας βοηθήσουμε άμεσα.
        </p>
      </div>
    );
  }

  return null;
}