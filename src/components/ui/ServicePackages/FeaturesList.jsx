"use client";

import React, { useEffect, useState } from "react";
import FeaturesListEdit from "./FeaturesListEdit";
import FeaturesListItem from "./FeaturesListItem";
import useCreateServiceStore from "@/store/service/create/createServiceStore";

export default function FeaturesList() {
  const { packages, tier } = useCreateServiceStore();

  // console.log(features);
  return (
    <div className="table-style2 table-responsive bdr1 mb30 mt30">
      <table className="table table-borderless mb-0">
        <thead className="t-head">
          <tr>
            <th className="col pl30" scope="col">
              <span>Παροχή</span>
            </th>
            <th className="col pl30" scope="col">
              <span>Επιλογή ή Κέιμενο</span>
            </th>
          </tr>
        </thead>
        {packages[tier]?.features?.length ? (
          <tbody className="t-body">
            {packages[tier].features.map((feature, index) => (
              <FeaturesListItem feature={feature} index={index} key={index} />
            ))}
          </tbody>
        ) : null}
      </table>
    </div>
  );
}
