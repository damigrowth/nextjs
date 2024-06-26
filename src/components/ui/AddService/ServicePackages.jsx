"use client";

import Packages from "../ServicePackages/Packages";

export default function ServicePackages() {
  return (
    <>
      <div className="ps-widget bgc-white bdrs12 p30 mb30 overflow-hidden position-relative">
        <div className="bdrb1 ">
          <h3 className="list-title">Πακέτα</h3>
        </div>
        <Packages />
      </div>
    </>
  );
}
