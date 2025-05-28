import { serviceTimeOptions } from '../../../constants/options';
import RadioBox from '../../input/input-radio-box';

export default function Time() {
  return <RadioBox options={serviceTimeOptions} paramName='time' />;
}
