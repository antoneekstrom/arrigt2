import {
  DateInput,
  DateSegment,
  TimeField,
  TimeFieldProps,
  TimeValue,
} from "react-aria-components";
import { InputLabel } from "../atoms/InputLabel";
import { InputError } from "../atoms/InputError";

interface Props<T extends TimeValue> extends TimeFieldProps<T> {
  label?: string;
  errorMessage?: string;
}

export function TimeInput<T extends TimeValue>({
  label,
  errorMessage,
  ...props
}: Props<T>) {
  return (
    <TimeField {...props} className="flex flex-col">
      <InputLabel>{label}</InputLabel>
      <DateInput className="border-black border-2 py-1 px-3 rounded-lg flex flex-row">
        {(segment) => <DateSegment className="px-1" segment={segment} />}
      </DateInput>
      <InputError message={errorMessage} />
    </TimeField>
  );
}
