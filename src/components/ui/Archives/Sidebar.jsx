"use client";

import React from "react";
import ClearBtn from "./ClearBtn";

export default function Sidebar({ filters }) {
  return (
    <div className="list-sidebar-style1 d-none d-lg-block">
      <div className="accordion" id="accordionExample">
        {filters.map((filter, index) => (
          <div className="card mb20 pb10 mt-0" key={index}>
            <div className="card-header" id={`heading${index}`}>
              <h4>
                <button
                  className={`btn btn-link ps-0 pt-0 ${
                    index === 0 ? "" : "collapsed"
                  }`}
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target={`#collapse${index}`}
                  aria-expanded={index === 0 ? "true" : "false"}
                  aria-controls={`collapse${index}`}
                >
                  {filter.heading}
                </button>
              </h4>
            </div>
            <div
              id={`collapse${index}`}
              className={`collapse ${index === 0 ? "show" : ""}`}
              aria-labelledby={`heading${index}`}
              data-parent="#accordionExample"
            >
              {filter.component}
            </div>
          </div>
        ))}
      </div>
      <ClearBtn />
    </div>
  );
}
