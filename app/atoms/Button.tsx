import { ButtonHTMLAttributes } from "react";

type Props = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className">;

export function Button({ children, ...props }: Props) {
  return (
    <button
      {...props}
      className="border-black border-2 py-0.5 px-3 rounded-lg grow"
    >
      {children}
    </button>
  );
}
