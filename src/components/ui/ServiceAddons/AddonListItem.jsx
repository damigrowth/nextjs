"use client";

import React from "react";
import FeaturesListEdit from "../ServicePackages/FeaturesListEdit";
import AddonsListEdit from "./AddonsListEdit";
import useCreateServiceStore from "@/store/service/createServiceStore";

export default function AddonListItem({ addon, index }) {
  const { editAddon, editingAddon, editingInput, editingMode, deleteAddon } =
    useCreateServiceStore();

  // console.log("editingAddon", editingAddon);
  return (
    <React.Fragment key={index}>
      <tr className="bgc-thm3">
        <th>
          <h5>{addon.title}</h5>
          <p className="m0">{addon.description}</p>
        </th>
        <th>
          <span className="h4 fw700">{addon.price}€</span>
        </th>
        <th className="pl0">
          <button
            type="button"
            onClick={() => deleteAddon(index)}
            className="btn float-end p0"
          >
            <span className="text-thm2 flaticon-delete fz16 d-flex p-2 " />
          </button>

          <button
            type="button"
            onClick={() => editAddon(index)}
            className="btn float-end p0"
          >
            <span className="text-thm2 flaticon-pencil fz16 d-flex p-2" />
          </button>
        </th>
      </tr>
      {editingMode && editingInput === index ? (
        <AddonsListEdit index={index} />
      ) : null}
    </React.Fragment>
  );
}
