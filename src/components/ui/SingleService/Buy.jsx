"use client";

import useServiceOrderStore from "@/store/order/service";
import React, { useEffect } from "react";

export default function Buy({ price }) {
  const { order, setOrder, calculateTotal } = useServiceOrderStore();

  useEffect(() => {
    setOrder({ fixed: true, fixedPrice: price });
    calculateTotal();
  }, []);

  return (
    <a className="ud-btn btn-thm">
      Αγορά {order?.total}€ <i className="fal fa-arrow-right-long"></i>
    </a>
  );
}
