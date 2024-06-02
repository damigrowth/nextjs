"use client";

import useServiceOrderStore from "@/store/order/service";
import React, { useEffect } from "react";

export default function Addons({ addons, small }) {
  const { order, setOrder, calculateTotal } = useServiceOrderStore();

  const handleSelectAddons = (addon) => {
    const isExist = order.addons.some((a) => a.id === addon.id);

    if (!isExist) {
      setOrder({ addons: [...order.addons, addon] });
    } else {
      const newAddons = order.addons.filter((item) => item.id !== addon.id);
      setOrder({ addons: newAddons });
    }

    calculateTotal();
  };

  return (
    <div
      className={`pb-0 bg-white bdrs12 wow fadeInUp default-box-shadow1 ${
        !small ? "px30 pt30" : ""
      }`}
    >
      {!small && <h4>Extra Υπηρεσίες</h4>}
      <div className="extra-service-tab mb20 mt20">
        <nav>
          <div className="nav flex-column nav-tabs">
            {addons.map((addon, i) => (
              <button
                key={i}
                className={`${
                  !small
                    ? `nav-link ${
                        order.addons?.some((a) => a.id === addon.id)
                          ? "active"
                          : ""
                      }`
                    : "small-addon"
                }`}
              >
                {!small ? (
                  <label className="custom_checkbox fw500 text-start">
                    {addon.title}
                    <span className="text text-bottom">
                      {addon.description}
                    </span>
                    <input
                      type="checkbox"
                      checked={order.addons?.some((a) => a.id === addon.id)}
                      onChange={() => handleSelectAddons(addon)}
                    />
                    <span className="checkmark" />
                  </label>
                ) : (
                  <label className="small-addon-container">
                    <div className="small-addon-content">
                      <h5 className="small-addon-title">{addon.title}</h5>
                      <div className="small-addon-description">
                        {addon.description}
                      </div>
                      <div className="small-addon-price">{addon.price}€</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={order.addons?.some((a) => a.id === addon.id)}
                      onChange={() => handleSelectAddons(addon)}
                      className="small-addon-input"
                    />
                    <span className="small-addon-checkmark" />
                  </label>
                )}
                {!small && <span className="price">{addon.price}€</span>}
              </button>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}
