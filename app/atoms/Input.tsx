import { HTMLProps } from "react";

type Props = Omit<HTMLProps<HTMLInputElement>, "className">;

export function Input(props: Props) {
  return (
    <input
      {...props}
      className="border-black border-2 py-1 px-3 rounded-lg grow invalid:border-red-600"
    />
  );
}
