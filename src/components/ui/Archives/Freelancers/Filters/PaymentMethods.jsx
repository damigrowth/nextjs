import React from "react";
import CheckBox from "../../Inputs/CheckBox";
import { PAYMENT_METHODS } from "@/lib/graphql/queries";
import { getData } from "@/lib/client/operations";

export default async function PaymentMethods() {
  const { paymentMethods } = await getData(PAYMENT_METHODS);

  const options = paymentMethods.data.map((el) => ({
    value: el.id,
    label: el.attributes.label,
  }));

  return <CheckBox options={options} paramName="pay_m" />;
}
