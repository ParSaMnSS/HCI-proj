"use client";

import { motion } from "framer-motion";

export function Sheet({
  children,
  className = "",
  grabber = true,
}: {
  children: React.ReactNode;
  className?: string;
  grabber?: boolean;
}) {
  return (
    <motion.div
      initial={{ y: 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 380, damping: 38 }}
      className={`rounded-t-[32px] bg-white px-5 pt-3 shadow-[0_-12px_40px_rgba(20,20,40,0.14)] min-h-0 ${className}`}
      style={{ paddingBottom: "calc(1.25rem + var(--sab, 0px))" }}
    >
      {grabber && (
        <div className="mx-auto mb-4 h-[5px] w-14 rounded-full bg-[#e7e9f0]" />
      )}
      {children}
    </motion.div>
  );
}
