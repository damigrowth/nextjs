"use client";

import React, { useEffect, useRef, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";

import Input from "../inputs/Input";
import authStore from "@/store/authStore";
import { register } from "@/lib/auth/register";

function RegisterButton() {
  const { pending } = useFormStatus();
  return (
    <button disabled={pending} className="ud-btn btn-thm default-box-shadow2">
      {pending ? "Δημιουργία Λογαριασμού..." : "Εγγραφή"}{" "}
      <i className="fal fa-arrow-right-long" />
    </button>
  );
}

const RegisterForm = () => {
  const role = authStore((state) => state.role);

  const initialState = {
    errors: {},
    message: null,
    role: role,
  };

  const [formState, formAction] = useFormState(register, initialState);

  const formRef = useRef(null);

  useEffect(() => {
    if (formState) {
      formState.errors = {};
      formState.message = null;
      formState.role = role;
    }
    formRef.current?.reset();
  }, [role, formState]);

  if (role === 0) return null;

  return (
    <form ref={formRef} action={formAction}>
      <Input
        state={formState}
        label={""}
        type={"hidden"}
        placeholder={""}
        id={"role"}
        value={role}
        hideLabel
        defaultValue={role}
        name={"role"}
        disabled={formState?.loading}
        errorId={"role-error"}
      />
      <div className="mb25 row">
        <div className="col-sm">
          <Input
            state={formState}
            label={"Όνομα"}
            type={"text"}
            placeholder={""}
            id={"firstName"}
            name={"firstName"}
            disabled={formState?.loading}
            autoComplete={"given-name"}
            errorId={"firstName-error"}
            formatNumbers
            formatSpaces
            formatSymbols
            capitalize
          />
        </div>
        <div className="col-sm">
          <Input
            state={formState}
            label={"Επίθετο"}
            type={"text"}
            placeholder={""}
            id={"lastName"}
            name={"lastName"}
            disabled={formState?.loading}
            autoComplete={"family-name"}
            errorId={"lastName-error"}
            formatNumbers
            formatSpaces
            formatSymbols
            capitalize
          />
        </div>
      </div>

      <div className="mb25">
        <Input
          state={formState}
          label={"Email"}
          type={"email"}
          placeholder={""}
          id={"email"}
          name={"email"}
          disabled={formState?.loading}
          autoComplete={"email"}
          errorId={"email-error"}
          formatSpaces
        />
      </div>
      <div className="mb25">
        <Input
          state={formState}
          label={"Username"}
          type={"username"}
          placeholder={""}
          id={"username"}
          name={"username"}
          disabled={formState?.loading}
          autoComplete={"username"}
          errorId={"username-error"}
          formatSpaces
          formatSymbols
          lowerCase
        />
      </div>
      <div className="mb15">
        <Input
          state={formState}
          label={"Κωδικός"}
          type={"password"}
          placeholder={""}
          id={"password"}
          name={"password"}
          disabled={formState?.loading}
          errorId={"password-error"}
          formatSpaces
        />
      </div>
      {formState?.message && (
        <div className="mb20 text-danger">{formState?.message}</div>
      )}
      <div className="d-grid mb20">
        <RegisterButton />
      </div>
      <div className="hr_content mb20">
        <hr />
        <span className="hr_top_text">OR</span>
      </div>
      <div className="d-md-flex justify-content-between">
        <button className="ud-btn btn-fb fz14 fw400 mb-2 mb-md-0" type="button">
          <i className="fab fa-facebook-f pr10" /> Continue Facebook
        </button>
        <button
          className="ud-btn btn-google fz14 fw400 mb-2 mb-md-0"
          type="button"
        >
          <i className="fab fa-google" /> Continue Google
        </button>
        <button className="ud-btn btn-apple fz14 fw400" type="button">
          <i className="fab fa-apple" /> Continue Apple
        </button>
      </div>
    </form>
  );
};

export default RegisterForm;
