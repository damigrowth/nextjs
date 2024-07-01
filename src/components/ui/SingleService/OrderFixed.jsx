import React from "react";
import Addons from "./Addons";
import Buy from "./Buy";

export default function OrderFixed({ price, addons }) {
  return (
    <div className="price-widget">
      <div className="price mb40">{price}€</div>
      {addons.length > 0 && <Addons addons={addons} small />}
      <div className="d-grid">
        <Buy price={price} />
      </div>
    </div>
  );
}
