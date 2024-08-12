import PriceDropdown1 from "@/components/dropdown/PriceDropdown1";
import React from "react";
import Slider from "../../Inputs/RangeSlider";

export default function Price() {
  return <Slider iniMin={5} iniMax={1000} />;
}
