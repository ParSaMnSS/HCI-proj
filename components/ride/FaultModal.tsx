"use client";

import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { AlertIcon } from "@/components/ui/icons";
import { FAULT_COPY, type FaultKind } from "@/lib/mock/faults";

/**
 * Improved error-recovery dialog. Unlike BiTaksi's terse "Warning /
 * Authentication failed / Retry", this explains what happened, reassures
 * (e.g. "your card was not charged"), and offers a clear primary + fallback.
 */
export function FaultModal({
  fault,
  onPrimary,
  onSecondary,
}: {
  fault: FaultKind;
  onPrimary: () => void;
  onSecondary: () => void;
}) {
  const copy = FAULT_COPY[fault];
  return (
    <Modal>
      <div className="grid h-12 w-12 place-items-center rounded-full bg-alert text-white">
        <AlertIcon size={26} />
      </div>
      <h2 className="mt-4 text-2xl font-black leading-tight text-ink">{copy.title}</h2>
      <p className="mt-2 text-[15px] leading-relaxed text-muted">{copy.message}</p>

      <div className="mt-5 space-y-2">
        <Button full onClick={onPrimary}>
          {copy.primary}
        </Button>
        {copy.secondary && (
          <button
            onClick={onSecondary}
            className="w-full py-2 text-base font-bold text-brand underline"
          >
            {copy.secondary}
          </button>
        )}
      </div>
    </Modal>
  );
}
