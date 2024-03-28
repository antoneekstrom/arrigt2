import { Label, LabelProps } from "react-aria-components";

interface Props extends LabelProps {
  children: React.ReactNode;
  required?: boolean;
  // htmlFor: string;
}

export function InputLabel({ children, required, ...props }: Props) {
  return (
    <Label {...props} className="block text-sm uppercase">
      {children}
      {required && <span className="text-red-600">*</span>}
    </Label>
  );
}
