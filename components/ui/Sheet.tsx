"use client";

import { clsx } from "@/lib/clsx";

/** Bottom sheet that sits over the map, matching BiTaksi's rounded white card. */
export function Sheet({
  children,
  className,
  grabber = true,
}: {
  children: React.ReactNode;
  className?: string;
  grabber?: boolean;
}) {
  return (
    <div
      className={clsx(
        "rounded-t-[28px] bg-surface px-4 pt-2 pb-5 shadow-[0_-10px_30px_rgba(20,20,40,0.12)] animate-sheet",
        className,
      )}
    >
      {grabber && (
        <div className="mx-auto mb-3 mt-1 h-1.5 w-12 rounded-full bg-hairline" />
      )}
      {children}
    </div>
  );
}
