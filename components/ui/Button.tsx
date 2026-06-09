"use client";

import { motion } from "framer-motion";
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
  onClick,
  ...rest
}: Props) {
  return (
    <motion.button
      {...(rest as object)}
      whileTap={{ scale: disabled || loading ? 1 : 0.96 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      disabled={disabled || loading}
      onClick={onClick}
      className={clsx(
        "relative inline-flex items-center justify-center gap-2 font-extrabold transition-colors disabled:opacity-50",
        variant === "primary" &&
          "min-h-[56px] rounded-2xl bg-brand px-5 text-lg text-cream shadow-[0_8px_24px_rgba(46,26,143,0.3)] hover:bg-brand-700",
        variant === "outline" &&
          "min-h-[52px] rounded-2xl border-2 border-brand px-5 text-base text-brand",
        variant === "ghost" && "rounded-xl px-4 py-3 text-brand",
        variant === "chip" &&
          "min-h-[48px] rounded-2xl bg-chip px-4 text-sm font-bold text-brand",
        full && "w-full",
        className,
      )}
    >
      {loading && (
        <span className="spin h-5 w-5 rounded-full border-2 border-cream/30 border-t-cream" />
      )}
      {children}
    </motion.button>
  );
}
