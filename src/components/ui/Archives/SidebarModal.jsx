import React from "react";
import ClearButton from "@/components/button/ClearButton";
import SidebarModalBtn from "./SidebarModalBtn";
import SidebarModalOverlay from "./SidebarModalOverlay";

export default function SidebarModal({ filters, searchParams }) {
  return (
    <>
      <div className="lefttside-hidden-bar">
        <div className="hsidebar-header bdrb1">
          <h4 className="list-title">Όλα τα φίλτρα</h4>
          <SidebarModalBtn type="close" />
        </div>
        <div className="hsidebar-content">
          <div className="widget-wrapper">
            <div className="sidebar-accordion">
              <div className="accordion" id="accordionExample2">
                {filters.map((filter, index) => {
                  const paramsArray = filter.params.map(
                    (paramName) => searchParams[paramName]
                  );

                  const hasParams = paramsArray.some(
                    (param) => param !== undefined && param !== null
                  );

                  const hasChildPath = filter.childPath !== undefined;

                  const isCollapsed =
                    index !== 0 && !hasParams && !hasChildPath;

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
                          <h4 className="archive-filters-title">
                            {filter.heading}
                          </h4>
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
              <ClearButton />
            </div>
          </div>
        </div>
      </div>
      <SidebarModalOverlay />
    </>
  );
}
