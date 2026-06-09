"use client";

import { clsx } from "@/lib/clsx";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "outline" | "ghost" | "chip";
  full?: boolean;
  loading?: boolean;
};

export function Button({
  variant = "primary",
  full,
  loading,
  className,
  children,
  disabled,
  ...rest
}: Props) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={clsx(
        "relative inline-flex items-center justify-center gap-2 font-extrabold transition active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100",
        variant === "primary" &&
          "bg-brand text-cream rounded-2xl px-5 py-4 text-lg shadow-[0_8px_22px_rgba(46,26,143,0.28)] hover:bg-brand-700",
        variant === "outline" &&
          "border-2 border-brand text-brand rounded-2xl px-4 py-3",
        variant === "ghost" && "text-brand rounded-xl px-3 py-2",
        variant === "chip" &&
          "bg-chip text-brand rounded-xl px-3 py-3 text-sm font-bold",
        full && "w-full",
        className,
      )}
    >
      {loading && (
        <span className="h-5 w-5 rounded-full border-2 border-cream/40 border-t-cream animate-spin-slow" />
      )}
      {children}
    </button>
  );
}
