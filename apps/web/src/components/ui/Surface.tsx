import type { HTMLAttributes, ReactNode } from "react";

type Props = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

export default function Surface({ children, className = "", ...props }: Props) {
  return (
    <div className={["surface", className].filter(Boolean).join(" ")} {...props}>
      {children}
    </div>
  );
}
