"use client";

import React, { useRef, useActionState, useEffect } from "react";
import Input from "../../inputs/Input";
import authStore from "@/store/authStore";
import { register } from "@/lib/auth/register";
import RadioSelect from "../Archives/Inputs/RadioSelect";

function RegisterButton() {
  return (
    <button type="submit" className="ud-btn btn-thm default-box-shadow2">
      Εγγραφή <i className="fal fa-arrow-right-long" />
    </button>
  );
}

const RegisterForm = () => {
  const { type, role, roles, setAuthRole } = authStore();
  const formRef = useRef(null);

  const [state, formAction] = useActionState(register, {
    errors: {},
    message: null,
    role: role,
  });

  useEffect(() => {
    if (state) {
      state.errors = {};
      state.message = null;
      setAuthRole(null);
    }
    formRef.current?.reset();
  }, [type]);

  if (type === 0) return null;

  return (
    <form ref={formRef} action={formAction}>
      <input
        type="text"
        name="type"
        value={type}
        readOnly
        hidden
        className="hidden"
      />
      {type === 2 && (
        <>
          <div className="mb25">
            <RadioSelect
              id="role"
              name="role"
              options={roles}
              value={role}
              onChange={(e) => setAuthRole(Number(e.target.value))}
            />
          </div>
          <div className="mb25">
            <Input
              state={state}
              label="Επωνυμία"
              type="text"
              id="brandName"
              name="brandName"
              disabled={state?.loading}
              errorId="brandName-error"
              formatSpaces
              formatSymbols
              formatNumbers
              capitalize
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
              formatNumbers
              capitalize
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

      <div className="d-grid mt40 mb20">
        <RegisterButton />
      </div>
    </form>
  );
};

export default RegisterForm;
