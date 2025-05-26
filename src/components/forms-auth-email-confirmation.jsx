"use client";

import { confirmTokenAction } from "@/lib/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useActionState, useEffect, useRef } from "react";

export default function EmailConfirmationForm({ confirmationToken }) {
  const [state, formAction, isPending] = useActionState(confirmTokenAction, {
    success: false,
    message: "",
    redirect: false,
  });

  const router = useRouter();
  // Use a ref to track if we've already submitted the token
  const hasSubmittedToken = useRef(false);

  useEffect(() => {
    // Only submit token if it exists and hasn't been submitted yet
    if (confirmationToken && !hasSubmittedToken.current) {
      // Mark as submitted immediately to prevent double submission
      hasSubmittedToken.current = true;

      const submitToken = () => {
        formAction(confirmationToken);
      };

      // Use startTransition to wrap the action dispatch
      React.startTransition(() => {
        submitToken();
      });
    }
  }, [confirmationToken, formAction]); // Keep dependencies minimal

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
        <div className="d-flex justify-content-center align-items-center">
          <div className="spinner-border text-thm mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted ml10">
            Ανακατεύθυνση στον πίνακα ελέγχου...
          </p>
        </div>
      </div>
    );
  }

  if (state?.message && !state?.success) {
    return (
      <div className="text-center">
        <div className="text-danger mb-3">
          <i className="fa fa-exclamation-circle fa-3x"></i>
        </div>
        <p className="text-danger">{state.message}</p>
        <p className="mt-3">
          Εάν υπάρχει πρόβλημα επικοινωνήστε μαζί μας στο contact@doulitsa.gr
          και θα σας βοηθήσουμε άμεσα.
        </p>
      </div>
    );
  }

  return (
    <div className="text-center">
      <div className="spinner-border text-thm mb-3" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      <p className="text-muted">Προετοιμασία επιβεβαίωσης...</p>
    </div>
  );
}
