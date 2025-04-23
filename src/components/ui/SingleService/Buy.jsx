"use client";

import useServiceOrderStore from "@/store/order/service";
import Link from "next/link";
import React, { useEffect } from "react";

export default function Buy({ price, isOwner }) {
  const { order, setOrder, calculateTotal } = useServiceOrderStore();

  useEffect(() => {
    setOrder({ fixed: true, fixedPrice: price });
    calculateTotal();
  }, []);

  if (!isOwner) {
    return (
      <div className="d-grid mt20">
        <button
          type="button"
          className="ud-btn btn-thm"
          data-bs-toggle="modal"
          data-bs-target="#startChatModal"
        >
          {price === 0 || price === null
            ? "Επικοινωνήστε"
            : `Σύνολο ${order?.total}€`}{" "}
          <i className="fal fa-arrow-right-long" />
        </button>
      </div>
    );
  } else {
    return null;
  }
}
