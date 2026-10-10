import type { ReactNode } from "react";

const VARIANT_CLASSNAME = {
  default:
    "w-full rounded-lg border border-input bg-white px-4 py-3 text-base text-foreground outline-none transition-colors focus:border-[#5FD0FF]",
  pill: "rounded-full border border-input bg-white px-4 py-2.5 text-sm font-semibold text-foreground outline-none transition-colors focus:border-[#5FD0FF]",
} as const;

export function SelectField({
  label,
  hideLabel = false,
  variant = "default",
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  hideLabel?: boolean;
  variant?: "default" | "pill";
  children: ReactNode;
}) {
  return (
    <label className={variant === "pill" ? "inline-block" : "block"}>
      <span
        className={hideLabel ? "sr-only" : "mb-1.5 block text-sm font-semibold text-foreground"}
      >
        {label}
      </span>
      <select {...props} className={VARIANT_CLASSNAME[variant]}>
        {children}
      </select>
    </label>
  );
}
