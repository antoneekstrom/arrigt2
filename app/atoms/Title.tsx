import React from "react";

type Props = {
  children: React.ReactNode;
};

export function Title({ children }: Props) {
  return <h1 className="text-2xl font-serif">{children}</h1>;
}
