"use client";

import { submitContactForm } from "@/lib/contact";
import React, { useActionState } from "react";

export default function ContactForm({ form }) {
  const [state, formAction, isPending] = useActionState(submitContactForm, {
    success: false,
    message: "",
  });

  return (
    <>
      <form action={formAction} className="form-style1">
        <div className="row">
          <div className="col-md-6">
            <div className="mb20">
              <label
                htmlFor="name"
                className="heading-color ff-heading fw500 mb10"
              >
                {form.nameLabel}
              </label>
              <input
                id="name"
                name="name"
                type="text"
                className="form-control"
                placeholder={form.namePlaceholder}
                required
                disabled={isPending}
              />
            </div>
          </div>
          <div className="col-md-6">
            <div className="mb20">
              <label
                htmlFor="email"
                className="heading-color ff-heading fw500 mb10"
              >
                {form.emailLabel}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                className="form-control"
                placeholder={form.emailPlaceholder}
                required
                disabled={isPending}
              />
            </div>
          </div>
          <div className="col-md-12">
            <div className="mb20">
              <label
                htmlFor="message"
                className="heading-color ff-heading fw500 mb10"
              >
                {form.messageLabel}
              </label>
              <textarea
                id="message"
                name="message"
                cols={30}
                rows={6}
                placeholder={form.messagePlaceholder}
                required
                disabled={isPending}
              />
            </div>
          </div>
          <div className="col-md-12">
            <div>
              <button
                type="submit"
                className="ud-btn btn-thm"
                disabled={isPending}
              >
                {form.buttonText}
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
          </div>
        </div>
      </form>
      {state.message && (
        <div
          className={`mt-3 ${state.success ? "text-success" : "text-danger"}`}
        >
          {state.message}
        </div>
      )}
    </>
  );
}