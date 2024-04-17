"use client";

import { useState } from "react";

export default function ServiceDetailExtra1({ addons }) {
  // console.log("addons====>", addons);

  const [getSelect, setSelect] = useState([]);

  // handler
  const serviceSelectHandler = (price) => {
    const isExist = getSelect.includes(price);

    if (!isExist) {
      return setSelect((old) => [...old, price]);
    }

    const deleted = getSelect.filter((item) => item !== price);
    setSelect(deleted);
  };

  return (
    <>
      <div className="extra-service-tab mb40 mt30">
        <nav>
          <div className="nav flex-column nav-tabs">
            {addons.map((addon, i) => (
              <button
                key={i}
                className={`nav-link ${
                  getSelect?.includes(addon.price) ? "active" : ""
                }`}
              >
                <label className="custom_checkbox fw500 text-start">
                  {addon.title}
                  <span className="text text-bottom">{addon.description}</span>
                  <input
                    type="checkbox"
                    checked={getSelect?.includes(addon.price)}
                    onChange={() => serviceSelectHandler(addon.price)}
                  />
                  <span className="checkmark" />
                </label>
                <span className="price">${addon.price}</span>
              </button>
            ))}
          </div>
        </nav>
      </div>
    </>
  );
}
