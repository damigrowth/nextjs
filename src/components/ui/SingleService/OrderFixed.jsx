import React from "react";
import Addons from "./Addons";
import Buy from "./Buy";

export default function OrderFixed({ price, addons, username }) {
  return (
    <div className="price-widget">
      {price > 0 && <div className="price">{price}€</div>}
      {addons.length > 0 && <Addons addons={addons} small />}
      <div className="d-grid">
        <Buy price={price} username={username} />
      </div>
    </div>
  );
}
