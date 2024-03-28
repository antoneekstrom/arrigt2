import { FieldError, FieldErrorProps } from "react-aria-components";

interface Props extends FieldErrorProps {
  message?: string;
}

export function InputError({ message, ...props }: Props) {
  return (
    <FieldError
      {...props}
      className="text-red-700 bg-red-100 font-medium px-3 py-1 rounded-lg"
    >
      {message}
    </FieldError>
  );
}
