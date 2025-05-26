import RadioBox from "./ui/Archives/Inputs/RadioBox";
import { serviceTimeOptions } from "./ui/Archives/options";

export default function Time() {
  return <RadioBox options={serviceTimeOptions} paramName="time" />;
}
