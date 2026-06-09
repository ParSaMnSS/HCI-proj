"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Toast } from "@/components/ui/Toast";
import { Modal } from "@/components/ui/Modal";
import { ChevronLeft, CardIcon, TrashIcon, CheckIcon, LockIcon, ShieldIcon, PlusIcon } from "@/components/ui/icons";
import { useStore } from "@/lib/store";

export default function PaymentPage() {
  const router = useRouter();
  const cards = useStore((s) => s.cards);
  const addCard = useStore((s) => s.addCard);
  const makeDefault = useStore((s) => s.makeDefault);
  const removeCard = useStore((s) => s.removeCard);
  const showToast = useStore((s) => s.showToast);
  const [adding, setAdding] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", stiffness: 380, damping: 36 }}
      className="absolute inset-0 flex flex-col bg-white"
    >
      <Toast />

      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 pb-3"
        style={{ paddingTop: "calc(var(--sat, 0px) + 14px)" }}
      >
        <motion.button
          whileTap={{ scale: 0.9 }}
          aria-label="Back"
          onClick={() => router.back()}
          className="grid h-11 w-11 place-items-center rounded-full bg-chip text-brand"
        >
          <ChevronLeft />
        </motion.button>
        <h1 className="text-xl font-black text-ink">Payment methods</h1>
      </div>

      {/* Security banner */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mx-4 mb-4 flex items-center gap-3 rounded-2xl bg-lavender px-4 py-3.5"
      >
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand text-white">
          <ShieldIcon size={20} />
        </span>
        <p className="text-sm font-semibold text-brand leading-snug">
          Your card details are encrypted. bitaksi never sees your full card number.
        </p>
      </motion.div>

      {/* Cards */}
      <div className="flex-1 overflow-y-auto px-4">
        <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-muted">Saved cards</h2>

        <AnimatePresence>
          {cards.length === 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-2xl border-2 border-dashed border-hairline p-8 text-center text-muted"
            >
              No cards yet. Add one to pay cashless.
            </motion.p>
          )}
          {cards.map((c) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20, height: 0 }}
              layout
              className="mb-3 flex items-center gap-3 rounded-2xl border border-hairline p-4"
            >
              <span
                className="grid h-12 w-16 shrink-0 place-items-center rounded-xl text-sm font-black text-white"
                style={{
                  background: c.brand === "visa"
                    ? "linear-gradient(135deg,#1a1f71,#2e3aad)"
                    : "linear-gradient(135deg,#eb001b,#f79e1b)",
                }}
              >
                {c.brand === "visa" ? "VISA" : "MC"}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-ink">•••• •••• •••• {c.last4}</p>
                <p className="text-sm text-muted">{c.holder} · {c.exp}</p>
              </div>
              {c.isDefault ? (
                <span className="flex items-center gap-1.5 rounded-full bg-green/10 px-3 py-1.5 text-xs font-bold text-green">
                  <CheckIcon size={13} /> Default
                </span>
              ) : (
                <motion.button
                  whileTap={{ scale: 0.93 }}
                  onClick={() => { makeDefault(c.id); showToast("Default card updated", "ok"); }}
                  className="rounded-full bg-chip px-3 py-1.5 text-xs font-bold text-brand"
                >
                  Set default
                </motion.button>
              )}
              <motion.button
                whileTap={{ scale: 0.85 }}
                aria-label="Remove card"
                onClick={() => setConfirmDeleteId(c.id)}
                className="grid h-10 w-10 place-items-center rounded-full text-alert"
              >
                <TrashIcon size={18} />
              </motion.button>
            </motion.div>
          ))}
        </AnimatePresence>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => setAdding(true)}
          className="mt-1 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-brand py-4 font-extrabold text-brand"
        >
          <PlusIcon size={20} /> Add a new card
        </motion.button>
      </div>

      {/* Add card bottom sheet */}
      <AnimatePresence>
        {adding && (
          <AddCardSheet
            onClose={() => setAdding(false)}
            onSave={(c) => {
              addCard(c);
              setAdding(false);
              showToast("Card saved securely", "ok");
            }}
          />
        )}
      </AnimatePresence>

      {/* Confirm remove card */}
      <AnimatePresence>
        {confirmDeleteId && (
          <Modal onDismiss={() => setConfirmDeleteId(null)}>
            <h2 className="text-xl font-black text-ink">Remove card?</h2>
            <p className="mt-2 text-sm text-muted leading-relaxed">
              This card will be permanently removed from your account.
            </p>
            <div className="mt-6 flex flex-col gap-2">
              <Button
                full
                onClick={() => {
                  removeCard(confirmDeleteId);
                  showToast("Card removed", "warn");
                  setConfirmDeleteId(null);
                }}
              >
                Yes, remove it
              </Button>
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="w-full py-2 font-bold text-brand underline"
              >
                Cancel
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function AddCardSheet({ onClose, onSave }: {
  onClose: () => void;
  onSave: (c: { brand: "visa" | "mastercard"; last4: string; exp: string; holder: string }) => void;
}) {
  const [number, setNumber] = useState("");
  const [exp, setExp] = useState("");
  const [cvc, setCvc] = useState("");
  const [holder, setHolder] = useState("");
  const [saving, setSaving] = useState(false);

  const digits = number.replace(/\D/g, "");
  const numberValid = digits.length === 16;
  const expValid = /^\d{2}\/\d{2}$/.test(exp);
  const cvcValid = /^\d{3,4}$/.test(cvc);
  const holderValid = holder.trim().length >= 2;
  const valid = numberValid && expValid && cvcValid && holderValid;

  function fmt4(v: string) { return v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim(); }
  function fmtExp(v: string) { const d = v.replace(/\D/g, "").slice(0, 4); return d.length > 2 ? `${d.slice(0,2)}/${d.slice(2)}` : d; }

  function submit() {
    if (!valid) return;
    setSaving(true);
    setTimeout(() => {
      onSave({ brand: digits.startsWith("4") ? "visa" : "mastercard", last4: digits.slice(-4), exp, holder: holder.trim() });
    }, 800);
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 flex flex-col justify-end"
      style={{ background: "rgba(20,18,60,0.5)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 380, damping: 38 }}
        onClick={(e) => e.stopPropagation()}
        className="rounded-t-[32px] bg-white px-5 pt-4"
        style={{ paddingBottom: "calc(1.5rem + var(--sab, 0px))" }}
      >
        <div className="mx-auto mb-4 h-[5px] w-14 rounded-full bg-hairline" />
        <div className="flex items-center gap-2 mb-1">
          <CardIcon size={22} />
          <h2 className="text-xl font-black text-ink">Add card</h2>
        </div>
        <p className="mb-5 flex items-center gap-2 text-sm text-muted">
          <LockIcon size={15} /> Secured with 256-bit encryption
        </p>

        <CardField label="Card number" value={number} onChange={(v) => setNumber(fmt4(v))} placeholder="1234 5678 9012 3456" inputMode="numeric" error={number.length > 0 && !numberValid ? "Enter all 16 digits" : ""} valid={numberValid} />
        <div className="flex gap-3">
          <div className="flex-1"><CardField label="Expiry" value={exp} onChange={(v) => setExp(fmtExp(v))} placeholder="MM/YY" inputMode="numeric" error={exp.length > 0 && !expValid ? "MM/YY" : ""} valid={expValid} /></div>
          <div className="flex-1"><CardField label="CVC" value={cvc} onChange={(v) => setCvc(v.replace(/\D/g,"").slice(0,4))} placeholder="123" inputMode="numeric" error={cvc.length > 0 && !cvcValid ? "3–4 digits" : ""} valid={cvcValid} /></div>
        </div>
        <CardField label="Cardholder name" value={holder} onChange={setHolder} placeholder="Name on card" error="" valid={holderValid} />

        <div className="mt-4 space-y-2">
          <Button full loading={saving} disabled={!valid} onClick={submit}>
            {saving ? "Saving securely…" : "Save card"}
          </Button>
          <button onClick={onClose} className="w-full py-2 font-bold text-brand underline">Cancel</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function CardField({ label, value, onChange, placeholder, error, valid, inputMode }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder: string; error: string; valid: boolean; inputMode?: "numeric" | "text";
}) {
  return (
    <label className="mb-4 block">
      <span className="mb-1.5 block text-sm font-bold text-ink">{label}</span>
      <div className={`flex items-center gap-2 rounded-2xl border-2 px-4 py-3.5 ${error ? "border-alert" : valid ? "border-green" : "border-hairline"}`}>
        <input
          value={value} inputMode={inputMode}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent text-base font-bold text-ink outline-none placeholder:font-medium placeholder:text-muted"
        />
        <AnimatePresence>
          {valid && (
            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="text-green">
              <CheckIcon size={18} />
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      <AnimatePresence>
        {error && (
          <motion.span initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-1 block text-xs font-bold text-alert">{error}</motion.span>
        )}
      </AnimatePresence>
    </label>
  );
}
