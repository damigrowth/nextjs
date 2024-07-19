"use client";

import React from "react";
import ClearBtn from "./ClearBtn";

export default function Sidebar({ filters }) {
  return (
    <div className="list-sidebar-style1 d-none d-lg-block">
      <div className="accordion" id="accordionExample">
        {filters.map((filter, index) => {
          const paramsArray = Array.isArray(filter.params)
            ? filter.params
            : [filter.params];
          const hasParams = paramsArray.some(
            (param) => param !== undefined && param !== null && param !== ""
          );
          const isCollapsed = index !== 0 && !hasParams;

          return (
            <div className="card mb20 pb10 mt-0" key={index}>
              <button
                className={`btn btn-link ps-0 pt-0 ${
                  isCollapsed ? "collapsed" : ""
                }`}
                type="button"
                data-bs-toggle="collapse"
                data-bs-target={`#collapse${index}`}
                aria-expanded={!isCollapsed ? "true" : "false"}
                aria-controls={`collapse${index}`}
              >
                <div className="card-header" id={`heading${index}`}>
                  <h4 style={{ textAlign: "left" }}>{filter.heading}</h4>
                </div>
              </button>
              <div
                id={`collapse${index}`}
                className={`collapse ${!isCollapsed ? "show" : ""}`}
                aria-labelledby={`heading${index}`}
                data-parent="#accordionExample"
              >
                {filter.component}
              </div>
            </div>
          );
        })}
      </div>
      <ClearBtn />
    </div>
  );
}
