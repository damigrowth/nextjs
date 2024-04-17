"use client";

import React from "react";
import { login } from "@/lib/auth/login";
import { useFormState } from "react-dom";

function LoginButton() {
  return (
    <button type="submit" className="ud-btn btn-thm default-box-shadow2">
      Σύνδεση <i className="fal fa-arrow-right-long" />
    </button>
  );
}

const LoginForm = () => {
  const initialState = {};
  const [formState, formAction] = useFormState(login, initialState);

  console.log(formState);

  return (
    <form action={formAction}>
      <div className="mb25">
        <label htmlFor="email" className="form-label fw500 dark-color">
          Email
        </label>
        <input
          className="form-control"
          type="text"
          name="identifier"
          id="identifier"
          placeholder="Το email σου"
        />
      </div>
      <div className="mb15">
        <label htmlFor="password" className="form-label fw500 dark-color">
          Κωδικός
        </label>
        <input
          className="form-control"
          id="password"
          name="password"
          type="password"
          placeholder="Ο κωδικός σου"
          minLength={6}
        />
      </div>
      <div className="checkbox-style1 d-block d-sm-flex align-items-center justify-content-between mb20">
        <label className="custom_checkbox fz14 ff-heading">
          Θύμησε μου
          <input type="checkbox" defaultChecked="checked" />
          <span className="checkmark" />
        </label>
        <a className="fz14 ff-heading">Ξέχασες τον κωδικό σου?</a>
      </div>
      {formState?.message && (
        <div className="mb20 text-danger">{formState?.message}</div>
      )}
      <div className="d-grid mb20">
        <LoginButton />
      </div>
      <div className="hr_content mb20">
        <hr />
        <span className="hr_top_text">ή</span>
      </div>
      <div className="d-md-flex justify-content-between">
        <button className="ud-btn btn-fb fz14 fw400 mb-2 mb-md-0" type="button">
          <i className="fab fa-facebook-f pr10" /> Σύνδεση με Facebook
        </button>
        <button
          className="ud-btn btn-google fz14 fw400 mb-2 mb-md-0"
          type="button"
        >
          <i className="fab fa-google" /> Σύνδεση με Google
        </button>
        <button className="ud-btn btn-apple fz14 fw400" type="button">
          <i className="fab fa-apple" /> Σύνδεση με Apple
        </button>
      </div>
    </form>
  );
};

export default LoginForm;
