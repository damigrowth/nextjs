"use client";

import React from "react";
import authStore from "@/store/authStore";

export default function AuthTypeOptions() {
  const { type, setAuthType } = authStore();

  if (type > 0) {
    return (
      <a onClick={() => setAuthType(0)} className="ud-btn btn-white2 mb25 me-4">
        <i className="fal fa-arrow-left-long mr10 ml0"></i>Προηγούμενο Βήμα
      </a>
    );
  } else if (type === 0) {
    return (
      <div className="mb20-lg mb30">
        <button
          className="ud-btn btn-thm2 add-joining mr20"
          type="button"
          onClick={() => setAuthType(1)}
        >
          Εγγραφή ως Απλό Προφίλ
        </button>
        <button
          className="ud-btn btn-thm2 add-joining mr10-lg"
          type="button"
          onClick={() => setAuthType(2)}
        >
          Επαγγελματικό Προφίλ
        </button>
      </div>
    );
  }
}
