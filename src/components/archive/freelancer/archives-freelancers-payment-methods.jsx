import React from 'react';

import { getData } from '@/lib/client/operations';
import { PAYMENT_METHODS } from '@/lib/graphql';

import CheckBox from '../../input/checkbox';

export default async function PaymentMethods() {
  const { paymentMethods } = await getData(PAYMENT_METHODS);

  const options = paymentMethods.data.map((el) => ({
    value: el.id,
    label: el.attributes.label,
  }));

  return <CheckBox options={options} paramName='pay_m' />;
}
