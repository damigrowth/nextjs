import React from "react";
import SortOptions from "./SortOptions";
import FiltersModalBtn from "./SidebarModalBtn";
import SearchChip from "./Chips/SearchChip";

export default function Topbar({ meta, single, plural, sortOptions }) {
  let total = 0;

  if (meta.total === 0) {
    total = `0 ${single}`;
  } else if (meta.total === 1) {
    total = meta.total + " " + single;
  } else if (meta.total > 1) {
    total = meta.total + " " + plural;
  }

  return (
    <div className="row align-items-center mb20">
      <div className="col-md-6">
        <div className="d-flex text-center text-md-start">
          <p className="text mb-0 mb10-sm">
            <span className="fw500 data-loading-element">{total}</span>
          </p>
          <SearchChip />
        </div>
      </div>
      <div className="col-md-6">
        <div className="page_control_shorting d-md-flex align-items-center justify-content-center justify-content-md-end">
          <div className="dropdown-lists d-block d-lg-none me-2 mb10-sm">
            <ul className="p-0 mb-0 text-center text-md-start">
              <li>
                <FiltersModalBtn type="open" />
              </li>
            </ul>
          </div>
          <SortOptions sortOptions={sortOptions} />
        </div>
      </div>
    </div>
  );
}
