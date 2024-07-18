import React from "react";
import CheckBox from "../../Inputs/CheckBox";
import { getData } from "@/lib/client/operations";
import { SPECIALIZATIONS } from "@/lib/graphql/queries";

export default async function Specialization() {
  const { skills: specializations } = await getData(SPECIALIZATIONS);

  const options = specializations.data.map((el) => ({
    value: el.id,
    label: el.attributes.label,
  }));

  return <CheckBox options={options} paramName="spec" />;
}
