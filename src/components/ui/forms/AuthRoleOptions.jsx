"use client";

import React from "react";
import authStore from "@/store/authStore";

export default function AuthRoleOptions() {
  const setAuthRole = authStore((state) => state.setAuthRole);
  const role = authStore((state) => state.role);

  if (role > 0) {
    return (
      <a onClick={() => setAuthRole(0)} className="ud-btn btn-thm-border mb30">
        <i className="fal fa-arrow-left-long mr10 ml0"></i>Προηγούμενο Βήμα
      </a>
    );
  } else if (role === 0) {
    return (
      <div className="mb20-lg mb30">
        <button
          className="ud-btn btn-thm2 add-joining mr10-lg mr20"
          type="button"
          onClick={() => setAuthRole(4)}
        >
          Εγγραφή ως Freelancer
        </button>
        <button
          className="ud-btn btn-thm2 add-joining"
          type="button"
          onClick={() => setAuthRole(3)}
        >
          Εγγραφή ως Employer
        </button>
      </div>
    );
  }
}
