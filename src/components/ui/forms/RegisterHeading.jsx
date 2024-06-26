"use client";

import React from "react";
import authStore from "@/store/authStore";

export default function RegisterHeading() {
  const role = authStore((state) => state.role);
  return (
    <>
      {role === 0 && <h4>Δημιουργία λογαριασμού!</h4>}
      {role === 3 && <h4>Δημιουργία Freelancer λογαριασμού!</h4>}
      {role === 4 && <h4>Δημιουργία Employer λογαριασμού!</h4>}
    </>
  );
}
