"use client";

/** Centered modal card matching BiTaksi's dialogs (white rounded card, dimmed bg). */
export function Modal({
  children,
  onDismiss,
}: {
  children: React.ReactNode;
  onDismiss?: () => void;
}) {
  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center p-6 animate-fade"
      style={{ background: "rgba(20,18,60,0.45)" }}
      onClick={onDismiss}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-[340px] rounded-3xl bg-surface p-6 shadow-2xl animate-pop"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
