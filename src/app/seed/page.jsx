"use client";

import React from "react";
import { useFormState, useFormStatus } from "react-dom";
import { seedUsers } from "@/lib/seed/users";
import { inspect } from "@/utils/inspect";

function SeedButton() {
  const { pending } = useFormStatus();
  return (
    <button disabled={pending} className="ud-btn btn-thm default-box-shadow2">
      {pending ? "Seeding..." : "Seed"}{" "}
      <i className="fal fa-arrow-right-long" />
    </button>
  );
}

export default function page() {
  const initialState = {
    errors: {},
    message: null,
    data: null,
  };
  const [formState, formAction] = useFormState(seedUsers, initialState);

  inspect(formState);

  console.log(formState?.message);
  console.log(formState?.data);

  return (
    <form action={formAction}>
      <SeedButton />
    </form>
  );
}
