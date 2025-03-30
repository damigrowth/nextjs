"use client";

import { useState } from "react";
import { useFormState } from "react-dom";
import { completeRegistration } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { postData } from "@/lib/client/operations";
import { RESEND_CONFIRMATION } from "@/lib/graphql/mutations";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useActionState, useEffect } from "react";

export default function EmailConfirmationForm() {
  const [state, formAction] = useFormState(completeRegistration, null);
  const [email, setEmail] = useState("");
  const [resendStatus, setResendStatus] = useState(null);

  const router = useRouter();

  const handleResend = async () => {
    if (!email) {
      setResendStatus({
        success: false,
        message: "Παρακαλώ εισάγετε το email σας",
      });
      return;
    }

    try {
      const result = await postData(RESEND_CONFIRMATION, { email });
      if (result?.data?.resendEmailConfirmation?.ok) {
        setResendStatus({
          success: true,
          message: "Το email επιβεβαίωσης έχει σταλεί ξανά",
        });
      } else {
        setResendStatus({
          success: false,
          message: "Κάτι πήγε στραβά. Δοκιμάστε ξανά.",
        });
      }
    } catch (error) {
      setResendStatus({
        success: false,
        message: "Κάτι πήγε στραβά. Δοκιμάστε ξανά.",
      });
    }
  };

  useEffect(() => {
    if (state?.success && state?.redirect) {
      const timer = setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 2000); // Give user time to see success message

      return () => clearTimeout(timer);
    }
  }, [state, router]);

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
        <Link href="/login" className="ud-btn btn-thm default-box-shadow2">
          Σύνδεση
        </Link>
        <p className="mt-3 text-muted">
          Εάν υπάρχει οποιοδήποτε πρόβλημα επικοινώνησε μαζί μας στο{" "}
          <a href="mailto:contact@doulitsa.gr" className="text-thm">
            contact@doulitsa.gr
          </a>
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <h2 className="text-2xl font-bold text-center mb-6">
        Επιβεβαίωση Email
      </h2>

      <form action={formAction} className="space-y-4">
        <div>
          <Input
            type="text"
            name="code"
            placeholder="Εισάγετε τον κωδικό επιβεβαίωσης"
            required
            className="w-full"
          />
        </div>

        {state?.success === false && (
          <div className="text-red-500 text-sm">{state.message}</div>
        )}

        <Button type="submit" className="w-full">
          Επιβεβαίωση
        </Button>
      </form>

      {state?.success === false && (
        <div className="mt-6 space-y-4">
          <p className="text-muted">
            Εάν υπάρχει οποιοδήποτε πρόβλημα επικοινώνησε μαζί μας στο{" "}
            <a href="mailto:contact@doulitsa.gr" className="text-thm">
              contact@doulitsa.gr
            </a>
          </p>

          <div className="space-y-2">
            <Input
              type="email"
              placeholder="Εισάγετε το email σας"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full"
            />
            <Button
              type="button"
              onClick={handleResend}
              className="w-full"
              variant="outline"
            >
              Αποστολή νέου κωδικού επιβεβαίωσης
            </Button>
          </div>

          {resendStatus && (
            <div
              className={`text-sm ${
                resendStatus.success ? "text-green-500" : "text-red-500"
              }`}
            >
              {resendStatus.message}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
