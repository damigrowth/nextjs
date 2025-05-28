'use client';

import React from 'react';
import CountUp from 'react-countup';

export default function Counter({ ...props }) {
  return <CountUp {...props} />;
}
