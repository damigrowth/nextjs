import React from "react";
import RangeSlider from "../../Inputs/RangeSlider";

export default function Rate() {
  return <RangeSlider iniMin={5} iniMax={100} type="hourly" />;
}
