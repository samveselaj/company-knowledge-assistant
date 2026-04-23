import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import Link from "next/link";

type Variant = "primary" | "secondary" | "danger";
type Size = "md" | "sm";

type CommonProps = {
  children: ReactNode;
  className?: string;
  variant?: Variant;
  size?: Size;
};

type ButtonProps = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: never;
  };

type LinkProps = CommonProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
  };

export function buttonClassName(variant: Variant = "secondary", size: Size = "md", className = "") {
  return ["ui-button", `ui-button-${variant}`, `ui-button-${size}`, className]
    .filter(Boolean)
    .join(" ");
}

export default function Button(props: ButtonProps | LinkProps) {
  const { children, className, variant = "secondary", size = "md", ...rest } = props;
  const resolvedClassName = buttonClassName(variant, size, className);

  if ("href" in props) {
    const { href, ...linkProps } = rest as LinkProps;
    return (
      <Link href={href} className={resolvedClassName} {...linkProps}>
        {children}
      </Link>
    );
  }

  return (
    <button className={resolvedClassName} {...(rest as ButtonProps)}>
      {children}
    </button>
  );
}
