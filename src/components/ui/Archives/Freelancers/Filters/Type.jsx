import React from "react";
import RadioBox from "../../Inputs/RadioBox";
import { getData } from "@/lib/client/operations";
import { FREELANCER_TYPES } from "@/lib/graphql/queries/main/freelancer";

export default async function Type() {
  const { freelancerTypes } = await getData(FREELANCER_TYPES);

  const options = freelancerTypes.data.map((el) => ({
    value: el.id,
    label: el.attributes.label,
  }));

  return <RadioBox options={options} paramName="type" />;
}
