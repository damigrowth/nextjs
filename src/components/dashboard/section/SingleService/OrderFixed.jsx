"use client";

import React, { useEffect } from "react";
import Addons from "./Addons";
import useServiceOrderStore from "@/store/order/service";

export default function OrderFixed({ price, addons }) {
  const { order, setOrder, calculateTotal } = useServiceOrderStore();

  useEffect(() => {
    setOrder({ fixed: true, fixedPrice: price });
    calculateTotal();
  }, []);

  return (
    <div className="price-widget">
      <div className="price mb40">{price}€</div>
      {addons.length > 0 && <Addons addons={addons} small />}
      <div className="d-grid">
        <a className="ud-btn btn-thm">
          Αγορά {order.total}€ <i className="fal fa-arrow-right-long"></i>
        </a>
      </div>
    </div>
  );
}
