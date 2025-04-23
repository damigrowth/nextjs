"use client";

import useServiceOrderStore from "@/store/order/service";
import Link from "next/link";
import React, { useEffect } from "react";

export default function Buy({ price, username, isOwner }) {
  const { order, setOrder, calculateTotal } = useServiceOrderStore();

  useEffect(() => {
    setOrder({ fixed: true, fixedPrice: price });
    calculateTotal();
  }, []);

  if (!isOwner && (price === 0 || price === null)) {
    return (
      <div className="d-grid mt20">
        <button
          type="button"
          className="ud-btn btn-thm"
          data-bs-toggle="modal"
          data-bs-target="#startChatModal"
        >
          Επικοινωνία <i className="fal fa-arrow-right-long" />
        </button>
      </div>
    );
  } else {
    return (
      <Link href={`/profile/${username}`} className="ud-btn btn-thm">
        {price === 0 || price === null
          ? "Επικοινωνήστε"
          : `Σύνολο ${order?.total}€`}
        <i className="fal fa-arrow-right-long"></i>
      </Link>
    );
  }
}
