import { InputError } from "../atoms/InputError";

type Props = {
  errors?: string[];
  id: string;
};

export function InputErrorList({ errors, id }: Props) {
  return (
    <ul id={id} className="flex flex-col gap-2 py-2">
      {errors?.map((error) => <InputError key={error} message={error} />)}
    </ul>
  );
}
