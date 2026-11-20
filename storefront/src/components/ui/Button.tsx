// One button for the whole site. A Link when it has "to", an <a> when it has "href", a <button> otherwise.
import type { ComponentProps, ReactNode } from "react";
import { Link } from "react-router";

type Variant = "solid" | "accent" | "outline" | "ghost";
type Size = "md" | "lg";
const base = "inline-flex items-center justify-center gap-2 rounded-pill font-semibold tracking-wide transition-[background,color,transform,box-shadow] duration-200 ease-out active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 select-none";
const variants: Record<Variant, string> = {
  solid: "bg-ink text-paper hover:bg-ink-soft",
  accent: "bg-accent text-accent-ink hover:brightness-110",
  outline: "border border-ink/20 bg-paper text-ink hover:border-ink",
  ghost: "text-ink hover:bg-sweep",
};
const sizes: Record<Size, string> = { md: "h-11 px-5 text-sm", lg: "h-14 px-7 text-base" };

type Common = { variant?: Variant; size?: Size; className?: string; children: ReactNode };
type Props =
  | (Common & { to: string } & Omit<ComponentProps<typeof Link>, "to" | "className" | "children">)
  | (Common & { href: string } & Omit<ComponentProps<"a">, "href" | "className" | "children">)
  | (Common & Omit<ComponentProps<"button">, "className" | "children">);

export function buttonClass(variant: Variant = "solid", size: Size = "md", extra = "") {
  return `${base} ${variants[variant]} ${sizes[size]} ${extra}`;
}

export function Button(props: Props) {
  const { variant, size, className = "", children, ...rest } = props;
  const cls = buttonClass(variant, size, className);
  if ("to" in rest) return <Link {...(rest as ComponentProps<typeof Link>)} className={cls}>{children}</Link>;
  if ("href" in rest) return <a {...(rest as ComponentProps<"a">)} className={cls}>{children}</a>;
  return <button type="button" {...(rest as ComponentProps<"button">)} className={cls}>{children}</button>;
}
