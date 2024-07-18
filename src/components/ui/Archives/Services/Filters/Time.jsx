import RadioBox from "../../Inputs/RadioBox";
import { serviceTimeOptions } from "../../options";

export default function Time() {
  return <RadioBox options={serviceTimeOptions} paramName="time" />;
}
