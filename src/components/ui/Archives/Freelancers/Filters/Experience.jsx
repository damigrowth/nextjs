import React from "react";
import RadioBox from "../../Inputs/RadioBox";
import { freelancerExperienceOptions } from "../../options";

export default function Experience() {
  return <RadioBox options={freelancerExperienceOptions} paramName="exp" />;
}
