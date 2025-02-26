"use client";

import React from "react";
import FeaturesListEdit from "../ServicePackages/FeaturesListEdit";
import AddonsListEdit from "./AddonsListEdit";
import useCreateServiceStore from "@/store/service/create/createServiceStore";
import useEditServiceStore from "@/store/service/edit/editServiceStore";

export default function AddonListItem({ addon, index, editMode = false }) {
  // Choose the appropriate store based on editMode prop
  const store = editMode ? useEditServiceStore : useCreateServiceStore;

  const { editAddon, editingAddon, editingInput, editingMode, deleteAddon } =
    store();
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
        <AddonsListEdit index={index} editMode={editMode} />
      ) : null}
    </React.Fragment>
  );
}
