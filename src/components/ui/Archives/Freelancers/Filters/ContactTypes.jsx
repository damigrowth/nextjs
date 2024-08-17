import React from "react";
import CheckBox from "../../Inputs/CheckBox";
import { getData } from "@/lib/client/operations";
import { CONTACT_TYPES } from "@/lib/graphql/queries/main/contact";

export default async function ContactTypes() {
  const { contactTypes } = await getData(CONTACT_TYPES);

  const options = contactTypes.data.map((el) => ({
    value: el.id,
    label: el.attributes.label,
  }));

  return <CheckBox options={options} paramName="con_t" />;
}
