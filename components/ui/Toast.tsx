"use client";

import { useStore } from "@/lib/store";
import { CheckIcon, AlertIcon } from "./icons";

export function Toast() {
  const toast = useStore((s) => s.toast);
  if (!toast) return null;
  const ok = toast.tone === "ok";
  return (
    <div className="pointer-events-none absolute inset-x-0 top-14 z-[60] flex justify-center px-4">
      <div
        className="flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold text-white shadow-lg animate-pop"
        style={{ background: ok ? "var(--green)" : "var(--alert)" }}
        role="status"
      >
        <span className="text-white">
          {ok ? <CheckIcon size={18} /> : <AlertIcon size={18} />}
        </span>
        {toast.msg}
      </div>
    </div>
  );
}
