"use client";

import React, { useRef, useActionState } from "react";
import Input from "../../inputs/Input";
import authStore from "@/store/authStore";
import { register } from "@/lib/auth/register";

function RegisterButton() {
  return (
    <button type="submit" className="ud-btn btn-thm default-box-shadow2">
      Εγγραφή <i className="fal fa-arrow-right-long" />
    </button>
  );
}

const RegisterForm = () => {
  const role = authStore((state) => state.role);
  const formRef = useRef(null);
  
  const [state, formAction] = useActionState(register, {
    errors: {},
    message: null,
    role: role,
  });

  if (role === 0) return null;

  return (
    <form ref={formRef} action={formAction}>
      <Input
        state={state}
        type="hidden"
        id="role"
        value={role}
        defaultValue={role}
        name="role"
      />

      {role === 3 && (
        <>
          <div className="mb25">
            <Input
              state={state}
              label="Επωνυμία"
              type="text"
              id="companyName"
              name="companyName"
              disabled={state?.loading}
              errorId="companyName-error"
              formatSpaces
              formatSymbols
            />
          </div>
          <div className="mb25">
            <Input
              state={state}
              label="Όνομα εμφάνισης"
              type="text"
              id="displayName"
              name="displayName"
              disabled={state?.loading}
              errorId="displayName-error"
              formatSpaces
              formatSymbols
            />
          </div>
        </>
      )}

      <div className="mb25">
        <Input
          state={state}
          label="Email"
          type="email"
          id="email"
          name="email"
          disabled={state?.loading}
          autoComplete="email"
          errorId="email-error"
          formatSpaces
        />
      </div>

      <div className="mb25">
        <Input
          state={state}
          label="Username"
          type="username"
          id="username"
          name="username"
          disabled={state?.loading}
          autoComplete="username"
          errorId="username-error"
          formatSpaces
          formatSymbols
          lowerCase
        />
      </div>

      <div className="mb15">
        <Input
          state={state}
          label="Κωδικός"
          type="password"
          id="password"
          name="password"
          disabled={state?.loading}
          errorId="password-error"
          formatSpaces
        />
      </div>

      {state?.message && (
        <div className="mb20 text-danger">{state?.message}</div>
      )}

      <div className="d-grid mb20">
        <RegisterButton />
      </div>
    </form>
  );
};

export default RegisterForm;