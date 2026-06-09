"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { AlertIcon } from "@/components/ui/icons";
import { FAULT_COPY, type FaultKind } from "@/lib/mock/faults";

export function FaultModal({ fault, onPrimary, onSecondary }: {
  fault: FaultKind;
  onPrimary: () => void;
  onSecondary: () => void;
}) {
  const copy = FAULT_COPY[fault];
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 flex items-center justify-center px-6"
      style={{ background: "rgba(20,18,60,0.5)" }}
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.85, opacity: 0 }}
        transition={{ type: "spring", stiffness: 340, damping: 28 }}
        className="w-full max-w-[360px] rounded-3xl bg-white p-7 shadow-2xl"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 18, delay: 0.1 }}
          className="grid h-14 w-14 place-items-center rounded-full bg-alert text-white"
        >
          <AlertIcon size={28} />
        </motion.div>

        <h2 className="mt-5 text-2xl font-black leading-tight text-ink">{copy.title}</h2>
        <p className="mt-2 text-[15px] leading-relaxed text-muted">{copy.message}</p>

        <div className="mt-6 space-y-2.5">
          <Button full onClick={onPrimary}>{copy.primary}</Button>
          {copy.secondary && (
            <button onClick={onSecondary} className="w-full py-2 text-base font-bold text-brand underline">
              {copy.secondary}
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
