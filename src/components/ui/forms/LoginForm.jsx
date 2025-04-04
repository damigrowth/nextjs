"use client";

import React from "react";
import Input from "@/components/inputs/Input";
import { login } from "@/lib/auth";
import Link from "next/link";
import { useActionState } from "react";
import { useRouter } from "next/navigation";

const LoginForm = () => {
  const initialState = {
    errors: {},
    message: null,
  };

  const [state, formAction, isPending] = useActionState(login, initialState);
  const router = useRouter();

  // Handle redirect after form submission
  React.useEffect(() => {
    if (state?.redirect) {
      router.push(state.redirect);
    }
  }, [state, router]);

  return (
    <form action={formAction}>
      <div className="mb25">
        <Input
          state={state}
          label="Email"
          type="email"
          name="identifier"
          id="identifier"
          placeholder="Το email σου"
          disabled={isPending}
          errorId="identifier-error"
          formatSpaces
          autoComplete="email"
        />
      </div>
      <div className="mb15">
        <Input
          state={state}
          label="Κωδικός"
          type="password"
          name="password"
          id="password"
          placeholder="Ο κωδικός σου"
          disabled={isPending}
          minLength={6}
          errorId="password-error"
          formatSpaces
          autoComplete="current-password"
        />
      </div>
      <div className="checkbox-style1 d-block d-sm-flex align-items-center justify-content-between mb20">
        <Link href="/forgot-password" className="fz14 ff-heading">
          Ξέχασες τον κωδικό σου?
        </Link>
      </div>

      {state?.message && (
        <div
          className={`mb20 ${state.success ? "text-success" : "text-danger"}`}
        >
          {state.message}
        </div>
      )}

      <div className="d-grid mt40 mb20">
        <button
          disabled={isPending}
          type="submit"
          className="ud-btn btn-thm default-box-shadow2"
        >
          Σύνδεση
          {isPending ? (
            <span
              className="spinner-border spinner-border-sm ml10"
              role="status"
            >
              <span className="sr-only"></span>
            </span>
          ) : (
            <i className="fal fa-arrow-right-long" />
          )}
        </button>
      </div>
    </form>
  );
};

export default LoginForm;
