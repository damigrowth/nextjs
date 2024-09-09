"use client";

import useServiceOrderStore from "@/store/order/service";
import Link from "next/link";
import React, { useEffect } from "react";

export default function Buy({ price, username }) {
  const { order, setOrder, calculateTotal } = useServiceOrderStore();

  useEffect(() => {
    setOrder({ fixed: true, fixedPrice: price });
    calculateTotal();
  }, []);

  return (
    <Link href={`/profile/${username}`} className="ud-btn btn-thm">
      {price === 0 || price === null
        ? "Επικοινωνήστε"
        : `Σύνολο ${order?.total}€`}
      <i className="fal fa-arrow-right-long"></i>
    </Link>
  );
}
