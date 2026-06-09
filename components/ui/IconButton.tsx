"use client";

import { clsx } from "@/lib/clsx";

/** Round floating button, like BiTaksi's map controls. Always has an aria-label. */
export function IconButton({
  label,
  onClick,
  tone = "white",
  children,
  className,
}: {
  label: string;
  onClick?: () => void;
  tone?: "white" | "brand" | "green";
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      aria-label={label}
      onClick={onClick}
      className={clsx(
        "grid h-11 w-11 place-items-center rounded-full shadow-md transition active:scale-95",
        tone === "white" && "bg-white text-brand",
        tone === "brand" && "bg-brand text-white",
        tone === "green" && "bg-green text-white",
        className,
      )}
    >
      {children}
    </button>
  );
}
