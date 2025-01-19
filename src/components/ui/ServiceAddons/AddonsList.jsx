"use client";

import React, { useEffect, useState } from "react";
import AddonListItem from "./AddonListItem";
import useCreateServiceStore from "@/store/service/createServiceStore";

export default function AddonsList({ custom }) {
  const { addons } = useCreateServiceStore();

  // console.log(features);
  return (
    <div
      className={
        custom
          ? "table-style2 table-responsive bdr1"
          : "table-style2 table-responsive bdr1 mb30 mt30"
      }
    >
      <table
        className="table table-borderless mb-0"
        style={{ backgroundColor: "white" }}
      >
        <colgroup>
          <col style={{ width: "65%" }} />
          <col style={{ width: "20%" }} />
          <col style={{ width: "15%" }} />
        </colgroup>
        <thead className="t-head">
          <tr>
            <th className="col pl30" scope="col">
              <span>Πρόσθετο</span>
            </th>
            <th className="col pl30" scope="col">
              <span>Τιμή</span>
            </th>
          </tr>
        </thead>
        {addons.length ? (
          <tbody className="t-body">
            {addons.map((addon, index) => (
              <AddonListItem addon={addon} index={index} key={index} />
            ))}
          </tbody>
        ) : null}
      </table>
    </div>
  );
}
